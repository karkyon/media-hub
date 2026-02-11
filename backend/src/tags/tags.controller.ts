import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TagsService } from './tags.service';

class TagResponseDto {
  id: number;
  name: string;
}

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'タグ一覧取得' })
  @ApiResponse({
    status: 200,
    description: 'タグ一覧を返却',
    type: [TagResponseDto],
  })
  async findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'タグ詳細取得' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'タグID',
  })
  @ApiResponse({
    status: 200,
    description: 'タグ詳細を返却',
    type: TagResponseDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }
}
