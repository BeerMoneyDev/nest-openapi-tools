import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiOkResponse, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs/promises';
import * as yaml from 'yaml';
import { OpenApiNestFactory } from '../src';

@Controller()
class AppController {
  @Get('')
  @ApiOkResponse({
    type: 'string',
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
  it('should generate YAML file from defaults', async () => {
    // arrange
    jest.setTimeout(15000);

    const app = await NestFactory.create(AppModule);

    // act
    await OpenApiNestFactory.configure(
      app,
      new DocumentBuilder().setTitle('My API').addBearerAuth(),
    );

    // assert
    const file = await fs.readFile('./openapi.yaml', 'utf8');
    const yamlObj = yaml.parse(file);
    expect(yamlObj).toMatchObject({ info: { title: 'My API' } });
  });

  it('should generate AWS extensions in the YAML file as expected', async () => {
    // arrange
    jest.setTimeout(15000);

    const app = await NestFactory.create(AppModule);

    // act
    await OpenApiNestFactory.configure(
      app,
      new DocumentBuilder().setTitle('My API').addBearerAuth(),
      {
        fileGeneratorOptions: {
          enabled: true,
          outputFilePath: './test/openapi-override.yaml',
          aws: {
            enabled: true,
            apiGatewayExtensionOptions: {
              enabled: true,
              lambdaResourceName: 'MyLambda',
              addPolicy: true,
              vpceIdParamName: 'MyVpceId',
            },
          },
        },
      },
    );

    // assert
    const file = await fs.readFile('./test/openapi-override.yaml', 'utf8');
    const yamlObj = yaml.parse(file);
    expect(yamlObj).toMatchObject({ info: { title: 'My API' } });
    expect(yamlObj['x-amazon-apigateway-policy']).toBeDefined();
    expect(yamlObj.servers).toContainEqual({
      'x-amazon-apigateway-endpoint-configuration': {
        vpcEndpointIds: [{ Ref: 'MyVpceId' }],
      },
    });
    expect(
      yamlObj.paths['/']['get']['x-amazon-apigateway-integration'],
    ).toBeDefined();
  });
});
