import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerDocumentOptions } from '@nestjs/swagger';
import { OpenApiToolsModule } from './openapi-tools.module';
import { OpenApiOptions, OpenApiService } from './openapi.service';

export class OpenApiNestFactory {
  public static async configure(
    app: INestApplication,
    toolsOptions: OpenApiOptions,
    swaggerOptions?: SwaggerDocumentOptions,
  ) {
    const openApiToolsModule = await NestFactory.createApplicationContext(
      OpenApiToolsModule,
    );
    await openApiToolsModule.get(OpenApiService).configure(app, toolsOptions, swaggerOptions);
  }
}
