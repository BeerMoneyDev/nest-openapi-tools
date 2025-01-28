import { NestFactory } from '@nestjs/core';
import { OpenApiNestFactory } from './openapi-nest.factory';
import { OpenApiToolsModule } from './openapi-tools.module';
import { OpenApiService } from './openapi.service';
import { SwaggerModule } from '@nestjs/swagger';

describe('', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

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

  it('should call setup method of SwaggerModule with provided custom options', async () => {
    const app = {
      get: jest.fn(),
    };
    const documentBuilder = {
      build: jest.fn().mockReturnValue({ info: { title: 'My API' } }),
    };

    const swaggerOptions = {};

    const swaggerModuleSetupSpy = jest
      .spyOn(SwaggerModule, 'setup')
      .mockReturnValue({} as any);

    jest.spyOn(SwaggerModule, 'createDocument').mockReturnValue({} as any);

    const webServerPath = 'api/swagger';
    const webServerCustomOptions = {
      swaggerOptions: {
        oauth2RedirectUrl: 'http://localhost:3000/api/swagger',
      },
    };

    await OpenApiNestFactory.configure(
      app as any,
      documentBuilder as any,
      {
        webServerOptions: {
          enabled: true,
          path: webServerPath,
          customOptions: webServerCustomOptions,
        },
      },
      swaggerOptions,
    );

    expect(swaggerModuleSetupSpy).toBeCalledWith(
      webServerPath,
      app,
      {},
      webServerCustomOptions,
    );
  });
});
