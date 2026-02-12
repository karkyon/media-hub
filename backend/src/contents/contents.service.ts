import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Content } from './content.entity';
import { Tag } from '../tags/tag.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import * as fs from 'fs';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    type?: string,
    keyword?: string,
    tag?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (type && (type === 'image' || type === 'video')) {
      where.type = type;
    }

    if (keyword) {
      where.title = Like(`%${keyword}%`);
    }

    const queryBuilder = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.tags', 'tag')
      .orderBy('content.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (type) {
      queryBuilder.andWhere('content.type = :type', { type });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(content.title LIKE :keyword OR content.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (tag) {
      queryBuilder.andWhere('tag.name = :tag', { tag });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!content) {
      throw new NotFoundException(`コンテンツID ${id} が見つかりません`);
    }

    return content;
  }

  async create(
    createContentDto: CreateContentDto,
    file: Express.Multer.File,
  ): Promise<Content> {
    const { title, description, type, isPublic, tags } = createContentDto;

    // タグの処理（文字列が来た場合はパース）
    let tagArray: string[] = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          tagArray = JSON.parse(tags);
        } catch {
          tagArray = [tags];
        }
      } else if (Array.isArray(tags)) {
        tagArray = tags;
      }
    }

    let tagEntities: Tag[] = [];
    if (tagArray.length > 0) {
      tagEntities = await this.findOrCreateTags(tagArray);
    }

    // コンテンツの作成
    const content = this.contentRepository.create({
      title,
      description,
      type,
      filePath: file.path.replace(/\\/g, '/').replace(/^\/media\//, ''),
      isPublic: isPublic !== undefined ? isPublic : true,
      tags: tagEntities,
    });

    return await this.contentRepository.save(content);
  }

  async update(
    id: number,
    updateContentDto: UpdateContentDto,
    file?: Express.Multer.File,
  ): Promise<Content> {
    const content = await this.findOne(id);

    // 既存ファイルの削除（ファイルが更新される場合）
    if (file && content.filePath) {
      if (fs.existsSync(content.filePath)) {
        fs.unlinkSync(content.filePath);
      }
    }

    // タグの更新
    if (updateContentDto.tags) {
      const tagEntities = await this.findOrCreateTags(updateContentDto.tags);
      content.tags = tagEntities;
    }

    // その他のフィールドを更新
    if (updateContentDto.title) content.title = updateContentDto.title;
    if (updateContentDto.description)
      content.description = updateContentDto.description;
    if (updateContentDto.isPublic !== undefined)
      content.isPublic = updateContentDto.isPublic;
    if (file) content.filePath = file.path.replace(/\\/g, '/').replace(/^\/media\//, '');

    return await this.contentRepository.save(content);
  }

  async remove(id: number): Promise<void> {
    const content = await this.findOne(id);

    // ファイルを削除
    if (content.filePath && fs.existsSync(content.filePath)) {
      fs.unlinkSync(content.filePath);
    }

    if (content.thumbnailPath && fs.existsSync(content.thumbnailPath)) {
      fs.unlinkSync(content.thumbnailPath);
    }

    await this.contentRepository.remove(content);
  }

  private async findOrCreateTags(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];

    for (const name of tagNames) {
      let tag = await this.tagRepository.findOne({ where: { name } });

      if (!tag) {
        tag = this.tagRepository.create({ name });
        tag = await this.tagRepository.save(tag);
      }

      tags.push(tag);
    }

    return tags;
  }
}
