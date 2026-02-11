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
} from '@nestjs/common';
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
     詳細取得
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
    return this.contentsService.findOne(id);
  }

  /* ===============================
     新規作成（★重要）
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
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  async create(
    @Body() createContentDto: CreateContentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.contentsService.create(createContentDto, file);
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
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentDto: UpdateContentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.contentsService.update(id, updateContentDto, file);
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
      properties: {
        status: { type: 'string', example: 'deleted' },
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.contentsService.remove(id);
    return { status: 'deleted' };
  }
}
