import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { stat, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import {
  ContentResponseDto,
  PaginatedContentResponseDto,
} from './dto/content-response.dto';
import { multerConfig } from '../common/multer.config';

// ========== デバッグユーティリティ ==========
const LOG_PREFIX = '[MediaController]';

function logInfo(label: string, data?: unknown) {
  if (data !== undefined) {
    console.log(`${LOG_PREFIX} ℹ️  ${label}`, data);
  } else {
    console.log(`${LOG_PREFIX} ℹ️  ${label}`);
  }
}

function logSuccess(label: string, data?: unknown) {
  if (data !== undefined) {
    console.log(`${LOG_PREFIX} ✅ ${label}`, data);
  } else {
    console.log(`${LOG_PREFIX} ✅ ${label}`);
  }
}

function logError(label: string, data?: unknown) {
  if (data !== undefined) {
    console.error(`${LOG_PREFIX} ❌ ${label}`, data);
  } else {
    console.error(`${LOG_PREFIX} ❌ ${label}`);
  }
}

function logWarn(label: string, data?: unknown) {
  if (data !== undefined) {
    console.warn(`${LOG_PREFIX} ⚠️  ${label}`, data);
  } else {
    console.warn(`${LOG_PREFIX} ⚠️  ${label}`);
  }
}

// mediaディレクトリの中身をダンプする
async function dumpMediaDirectory(mediaRoot: string) {
  try {
    const entries = await readdir(mediaRoot);
    logInfo('mediaRoot の中身', entries);

    for (const entry of entries) {
      const subPath = join(mediaRoot, entry);
      try {
        const subEntries = await readdir(subPath);
        logInfo(`  ${entry}/ の中身 (${subEntries.length}件)`, subEntries.slice(0, 10));
        if (subEntries.length > 10) {
          logInfo(`  ... 他 ${subEntries.length - 10}件`);
        }
      } catch {
        // ファイルの場合はreaddir失敗するので無視
      }
    }
  } catch (err: unknown) {
    const error = err as Error;
    logError('mediaRootのreaddir失敗', { path: mediaRoot, message: error.message });
  }
}

@ApiTags('contents')
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  /* ===============================
     一覧取得
     =============================== */
  @Get()
  @ApiOperation({ summary: 'コンテンツ一覧取得' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['image', 'video'] })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'コンテンツ一覧',
    type: PaginatedContentResponseDto,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('keyword') keyword?: string,
    @Query('tag') tag?: string,
  ) {
    return this.contentsService.findAll(
      page || 1,
      limit || 20,
      type,
      keyword,
      tag,
    );
  }

  /* ===============================
     メディアファイル配信 ★ :id より前に定義すること
     =============================== */
  @Get('media/*')
  @ApiOperation({ summary: 'メディアファイル配信' })
  async serveMedia(@Param('0') filePath: string, @Res() res: Response) {

    // ──────────────────────────────────────────
    // 1. リクエスト情報をログ
    // ──────────────────────────────────────────
    logInfo('━━━ serveMedia リクエスト ━━━');
    logInfo('受け取った filePath', filePath);
    logInfo('filePath 長さ', filePath?.length);
    logInfo('filePath 型', typeof filePath);

    // __dirnameの確認
    logInfo('__dirname', __dirname);

    // mediaRootのパス候補を全部列挙
    const candidates = [
      join(__dirname, '..', '..', '..', 'media', filePath),      // dist/contents → dist → backend → media
      join(__dirname, '..', '..', 'media', filePath),             // dist/contents → dist → media
      join(__dirname, '..', 'media', filePath),                   // dist/contents → media
      join(process.cwd(), 'media', filePath),                     // cwd/media
      join('/app', 'media', filePath),                            // Docker環境: /app/media
    ];

    logInfo('パス候補一覧');
    candidates.forEach((c, i) => logInfo(`  候補[${i}]`, c));

    // ──────────────────────────────────────────
    // 2. mediaRootを特定（どのパス候補が存在するか）
    // ──────────────────────────────────────────
    let resolvedPath: string | null = null;
    let mediaRoot: string | null = null;

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        resolvedPath = candidate;
        // mediaRoot = candidateからfilePath部分を除いたもの
        mediaRoot = candidate.substring(0, candidate.length - filePath.length - 1);
        logSuccess(`ファイル発見！`, { path: candidate, mediaRoot });
        break;
      } else {
        logWarn(`存在しない`, candidate);
      }
    }

    // ──────────────────────────────────────────
    // 3. ファイルが見つからない場合、mediaディレクトリをダンプ
    // ──────────────────────────────────────────
    if (!resolvedPath) {
      logError('全候補でファイルが見つかりません');
      logError('filePath の値', {
        raw: filePath,
        trimmed: filePath?.trim(),
        encoded: encodeURIComponent(filePath || ''),
      });

      // 各mediaRootを試してディレクトリダンプ
      const mediaRootCandidates = [
        join(__dirname, '..', '..', '..', 'media'),
        join(__dirname, '..', '..', 'media'),
        join(process.cwd(), 'media'),
        '/app/media',
      ];

      logWarn('mediaRootを探索中...');
      for (const root of mediaRootCandidates) {
        if (existsSync(root)) {
          logSuccess('mediaRoot 発見', root);
          await dumpMediaDirectory(root);
          break;
        } else {
          logWarn('mediaRoot 存在しない', root);
        }
      }

      return res.status(404).json({
        message: 'File not found',
        requestedFilePath: filePath,
        triedPaths: candidates,
        __dirname,
        cwd: process.cwd(),
      });
    }

    // ──────────────────────────────────────────
    // 4. statでファイル情報取得
    // ──────────────────────────────────────────
    try {
      const fileStat = await stat(resolvedPath);
      logSuccess('ファイル stat 情報', {
        size: `${(fileStat.size / 1024).toFixed(1)} KB`,
        isFile: fileStat.isFile(),
        isDirectory: fileStat.isDirectory(),
        mtime: fileStat.mtime,
      });
    } catch (err: unknown) {
      const error = err as Error;
      logError('stat 失敗', { path: resolvedPath, message: error.message });
    }

    // ──────────────────────────────────────────
    // 5. MIMEタイプを設定
    // ──────────────────────────────────────────
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
    };
    const mimeType = mimeMap[ext] || 'application/octet-stream';
    logInfo('MIMEタイプ', { ext, mimeType });
    res.setHeader('Content-Type', mimeType);

    // ──────────────────────────────────────────
    // 6. ファイル送信
    // ──────────────────────────────────────────
    logSuccess(`sendFile 実行`, resolvedPath);
    return res.sendFile(resolvedPath);
  }

  /* ===============================
     詳細取得 ★ media/* より後に定義すること
     =============================== */
  @Get(':id')
  @ApiOperation({ summary: 'コンテンツ詳細取得' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'コンテンツ詳細',
    type: ContentResponseDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    logInfo('findOne リクエスト', { id });
    const result = await this.contentsService.findOne(id);
    logInfo('findOne レスポンス filePath', result?.filePath);
    return result;
  }

  /* ===============================
     新規作成
     =============================== */
  @Post()
  @ApiOperation({ summary: 'コンテンツ登録' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateContentDto })
  @ApiResponse({
    status: 201,
    description: '登録成功',
    type: ContentResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async create(
    @Body() createContentDto: CreateContentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    logInfo('create リクエスト', {
      title: createContentDto.title,
      type: createContentDto.type,
      originalname: file?.originalname,
      size: file?.size,
      mimetype: file?.mimetype,
      path: file?.path,
      filename: file?.filename,
    });
    const result = await this.contentsService.create(createContentDto, file);
    logSuccess('create 完了', { id: result.id, filePath: result.filePath });
    return result;
  }

  /* ===============================
     更新
     =============================== */
  @Put(':id')
  @ApiOperation({ summary: 'コンテンツ更新' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateContentDto })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: ContentResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentDto: UpdateContentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    logInfo('update リクエスト', {
      id,
      file: file ? { originalname: file.originalname, size: file.size, path: file.path } : 'なし',
    });
    const result = await this.contentsService.update(id, updateContentDto, file);
    logSuccess('update 完了', { id: result.id, filePath: result.filePath });
    return result;
  }

  /* ===============================
     削除
     =============================== */
  @Delete(':id')
  @ApiOperation({ summary: 'コンテンツ削除' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: '削除成功',
    schema: {
      type: 'object',
      properties: { status: { type: 'string', example: 'deleted' } },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    logInfo('remove リクエスト', { id });
    await this.contentsService.remove(id);
    logSuccess('remove 完了', { id });
    return { status: 'deleted' };
  }
}