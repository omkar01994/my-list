import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe for robust input handling
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
  }));

  // Enable CORS for web/mobile clients  
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  const port = process.env.PORT || 8080;

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('My List Service API')
    .setDescription('OTT Platform My List Feature - Backend API for managing user favorite movies and TV shows')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}/`, 'Local environment')
    .addTag('my-list', 'My List management endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  writeFileSync('docs/swagger.json', JSON.stringify(document));
  
  await app.listen(port);
  console.log(`🚀 My List Service running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api`);
}
bootstrap();