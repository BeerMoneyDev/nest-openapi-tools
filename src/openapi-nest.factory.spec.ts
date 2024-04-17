import { NestFactory } from '@nestjs/core';
import { OpenApiNestFactory } from './openapi-nest.factory';
import { OpenApiToolsModule } from './openapi-tools.module';
import { OpenApiService } from './openapi.service';

describe('', () => {
  it('should configure OpenApiToolsModule and create an instance of it', async () => {
    // arrange
    const app = {
      get: jest.fn(),
    };
    const documentBuilder = {
      build: jest.fn().mockReturnValue({ info: { title: 'My API' } }),
    };
    const swaggerOptions = {};

    const openApiToolsModule = {
      get: jest.fn().mockReturnValue({
        configure: jest.fn(),
      }),
    };

    const createApplicationContextSpy = jest
      .spyOn(NestFactory, 'createApplicationContext')
      .mockResolvedValue(openApiToolsModule as any);

    // act
    await OpenApiNestFactory.configure(
      app as any,
      documentBuilder as any,
      {
        clientGeneratorOptions: {
          type: 'typescript-axios',
          outputFolderPath: '',
          openApiFilePath: '',
          enabled: true,
        },
      },
      swaggerOptions,
    );

    // assert
    expect(createApplicationContextSpy).toHaveBeenCalledWith(
      OpenApiToolsModule,
    );
    expect(openApiToolsModule.get).toHaveBeenCalledWith(OpenApiService);
  });
});
