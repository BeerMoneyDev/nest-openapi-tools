import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OpenApiToolsModule } from './openapi-tools.module';
import { OpenApiOptions, OpenApiService } from './openapi.service';

export class OpenApiNestFactory {
  public static async configure(
    app: INestApplication,
    options: OpenApiOptions,
  ) {
    const openApiToolsModule = await NestFactory.createApplicationContext(
      OpenApiToolsModule,
    );
    await openApiToolsModule.get(OpenApiService).configure(app, options);
  }
}
