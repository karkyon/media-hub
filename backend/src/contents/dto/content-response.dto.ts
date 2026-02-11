import { ApiProperty } from '@nestjs/swagger';

class TagDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '新入社員' })
  name: string;
}

export class ContentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '新入社員研修ビデオ' })
  title: string;

  @ApiProperty({ example: '2025年度新入社員向けの会社概要と業務フローの説明動画です。' })
  description: string;

  @ApiProperty({ enum: ['image', 'video'], example: 'video' })
  type: 'image' | 'video';

  @ApiProperty({ example: 'videos/video_1234567890.mp4' })
  filePath: string;

  @ApiProperty({ example: 'thumbnails/thumb_1234567890.jpg', nullable: true })
  thumbnailPath: string | null;

  @ApiProperty({ example: true })
  isPublic: boolean;

  @ApiProperty({ example: 1, nullable: true })
  createdBy: number | null;

  @ApiProperty({ example: '2025-02-09T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-02-09T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [TagDto] })
  tags: TagDto[];
}

export class PaginatedContentResponseDto {
  @ApiProperty({ type: [ContentResponseDto] })
  data: ContentResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
