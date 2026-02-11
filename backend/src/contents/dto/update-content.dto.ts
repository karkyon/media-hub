import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateContentDto {

  @ApiProperty({
    description: 'コンテンツのタイトル',
    example: '新入社員研修ビデオ',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'コンテンツの説明（Markdown対応）',
    example: '2025年度新入社員向けの会社概要と業務フローの説明動画です。',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ファイル（差し替え時のみ）',
    type: 'string',
    format: 'binary',
    required: false,
  })
  file?: any;

  @ApiProperty({
    description: '公開状態',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'タグ（配列）',
    example: ['新入社員', '研修', '必須'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(',').map(v => v.trim())
        : []
  )
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}