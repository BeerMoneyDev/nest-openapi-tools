import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiOkResponse, DocumentBuilder } from '@nestjs/swagger';
import { OpenApiNestFactory } from '../src';

@Controller()
class AppController {
  @Get('')
  @ApiOkResponse({
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
  fit('should generate YAML file from defaults', async () => {
    jest.setTimeout(15000);

    const app = await NestFactory.create(AppModule);
  
    await OpenApiNestFactory.configure(
      app,
      new DocumentBuilder()
        .setTitle('My API')
        .addBearerAuth(),
    );
  });

  it('should generate AWS extensions in the YAML file as expected', async () => {
    jest.setTimeout(15000);

    const app = await NestFactory.create(AppModule);
  
    await OpenApiNestFactory.configure(app,
      new DocumentBuilder()
        .setTitle('My API')
        .addBearerAuth(),
      {
      fileGeneratorOptions: {
        enabled: true,
        outputFilePath: './test/openapi-override.yaml',
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
