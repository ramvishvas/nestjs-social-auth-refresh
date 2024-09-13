import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { BaseExceptionsFilter } from './library/filters/base-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add logger middleware
  app.useLogger(app.get(Logger));

  // Validation pipe setup with configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove non-whitelisted parameters
      forbidNonWhitelisted: true, // throw an error when non-whitelisted parameters are passed
      transform: true, // transform payloads to their DTO instances
      transformOptions: {
        enableImplicitConversion: true, // enable implicit conversion of types
      },
    }),
  );

  // Cookie parser middleware setup to parse cookies from the request headers
  app.use(cookieParser());

  // Class serializer interceptor setup to filter out properties from the response payload based on the
  // @Exclude() decorator from the class-transformer package in the DTOs and entities classes
  // (e.g., src/posts/dto/create-post.dto.ts, src/posts/entities/post.entity.ts)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Use the global exception filter to catch all exceptions thrown in the application
  // and send a proper response to the client based on the exception type
  app.useGlobalFilters(new BaseExceptionsFilter());

  // Config service setup
  const configService = app.get(ConfigService);

  // Swagger setup with configuration
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE'))
    .setDescription(configService.get('SWAGGER_DESCRIPTION'))
    .setVersion(configService.get('SWAGGER_VERSION'))
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(configService.get('SWAGGER_PATH'), app, document);

  // Start the application
  await app.listen(configService.get('PORT'));
}

bootstrap();
