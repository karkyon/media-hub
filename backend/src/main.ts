import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS設定（社内LAN対応）
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://192.168.1.244:3000',
    ],
    credentials: true,
  });

  // グローバルバリデーションパイプ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger設定
  const config = new DocumentBuilder()
    .setTitle('社内メディア管理システム API')
    .setDescription('動画・画像の登録・閲覧を管理するREST API')
    .setVersion('1.0.0')
    .addTag('contents', 'コンテンツ管理')
    .addTag('tags', 'タグ管理')
    .addTag('health', 'ヘルスチェック')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'メディア管理API - Swagger UI',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
}

bootstrap();