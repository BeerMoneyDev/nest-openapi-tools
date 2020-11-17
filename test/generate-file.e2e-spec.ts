import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiResponse, DocumentBuilder } from '@nestjs/swagger';
import { OpenApiNestFactory } from '../src';

@Controller()
class AppController {
  @Get('')
  @ApiResponse({
    type: 'string'
  })
  hello() {
    return 'Hello';
  }
}

@Module({
  controllers: [AppController],
})
export class AppModule {}

describe('OpenApiToolsModule', () => {
  it('should generate AWS extensions in the YAML file as expected', async () => {
    const app = await NestFactory.create(AppModule);
  
    await OpenApiNestFactory.configure(app, {
      documentBuilder: new DocumentBuilder()
        .setDescription('My API')
        .addBearerAuth(),
      fileGeneratorOptions: {
        enabled: true,
        outputFilePath: './test/openapi.yaml',
        aws: {
          enabled: true,
          apiGatewayExtensionOptions: {
            enabled: true,
            lambdaResourceName: 'MyLambda',
          },
        },
      },
    }, {
      operationIdFactory: (c: string, method: string) => method,
    });
  });
});
