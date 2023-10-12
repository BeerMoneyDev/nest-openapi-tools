import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { AxiosClientGeneratorOptions } from './openapi-client-generator/axios.client-generator-options';
import { OpenApiToolsModule } from './openapi-tools.module';
import { OpenApiOptions, OpenApiService } from './openapi.service';

export class OpenApiNestFactory {
  static async configure(
    app: INestApplication,
    documentBuilder: DocumentBuilder,
    toolsOptions?: OpenApiOptions,
    swaggerOptions?: SwaggerDocumentOptions,
  ) {
    const openApiToolsModule =
      await NestFactory.createApplicationContext(OpenApiToolsModule);

    if (!toolsOptions) {
      toolsOptions = {};
    }

    if (toolsOptions?.webServerOptions?.enabled) {
      toolsOptions.webServerOptions = {
        ...{ path: 'api-docs' },
        ...toolsOptions.webServerOptions,
      };
    }

    if (toolsOptions?.fileGeneratorOptions?.enabled) {
      toolsOptions.fileGeneratorOptions = {
        ...{
          outputFilePath: './openapi.yaml',
        },
        ...toolsOptions.fileGeneratorOptions,
      };
    }

    if (toolsOptions?.clientGeneratorOptions?.enabled) {
      let outputFolderPath =
        toolsOptions?.clientGeneratorOptions?.outputFolderPath;

      if (outputFolderPath?.length) {
        outputFolderPath = new AxiosClientGeneratorOptions().outputFolderPath;
        try {
          const title = documentBuilder.build().info.title;
          if (title.length) {
            const slugifiedTitle = title
              .toString()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]+/g, '')
              .replace(/--+/g, '-');
            outputFolderPath = `../${slugifiedTitle}-client/src`;
          }
        } catch {}
      }

      toolsOptions.clientGeneratorOptions = new AxiosClientGeneratorOptions({
        outputFolderPath,
      });
    }

    if (!swaggerOptions) {
      swaggerOptions = {
        operationIdFactory: (controller: string, method: string) => method,
      };
    }

    await openApiToolsModule
      .get(OpenApiService)
      .configure(app, documentBuilder, toolsOptions, swaggerOptions);
  }
}
