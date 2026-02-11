import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ContentsModule } from './contents/contents.module';
import { TagsModule } from './tags/tags.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // TypeORM設定
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'media_user',
      password: process.env.DB_PASS || 'media_pass',
      database: process.env.DB_NAME || 'media_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 本番環境ではfalseに設定
      logging: process.env.NODE_ENV === 'development',
    }),

    // メディアファイルの静的配信
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'media'),
      serveRoot: '/media',
    }),

    // 各モジュール
    ContentsModule,
    TagsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
