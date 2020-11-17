# Nest OpenAPI Tools

This library provides basic tooling around OpenAPI integrations with NestJS.

# Installation

```bash
npm install -g @openapitools/openapi-generator-cli # Used to generate OpenAPI clients from documents.
npm install --save nest-openapi-tools @nestjs/swagger swagger-ui-express
```

# Usage

## OpenApiNestFactory

The OpenApiNestFactory simplifies the process of:

1. Generating an OpenAPI file.
2. Generating a client project (i.e. an Angular client module).
3. Starting up the OpenAPI documentation web server.

### How to use

To leverage this functionality, swap out the `NestFactory` provided by Nest with the `OpenApiNestFactory.configure()` call as demonstrated below.

```ts
// main.ts - BEFORE
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

```ts
// main.ts - AFTER
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenApiNestFactory } from '@aws-serverless-tools/nest';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await OpenApiNestFactory.configure(app, {
    documentBuilder: new DocumentBuilder()
      .setDescription('My API')
      .addBearerAuth(),
    webServerOptions: {
      enabled: true,
      path: 'api-docs',
    },
    fileGeneratorOptions: {
      enabled: true,
      outputFilePath: './openapi.yaml',  // or ./openapi.json
    },
    clientGeneratorOptions: {
      enabled: true,
      type: 'typescript-axios',
      outputFolderPath: '../typescript-api-client/src',
      additionalProperties:
        'apiPackage=clients,modelPackage=models,withoutPrefixEnums=true,withSeparateModelsAndApi=true',
      openApiFilePath: './openapi.yaml', // or ./openapi.json
      skipValidation: true, // optional, false by default
    },
  }, {
    operationIdFactory: (c: string, method: string) => method,
  });

  await app.listen(3000);
}
bootstrap();
```

In this example, we will (a) enable the documentation web server at http://localhost:3000, (b) generate the OpenAPI document at `./openapi.yaml`, and lastly (c) generate a TypeScript API client.

*Note*, file generation and client generation should be disabled in production as they are costly to startup time.

### Generator Options

This project leverages the [OpenAPITools/openapi-generator](https://github.com/OpenAPITools/openapi-generator) project via the npm package, `@openapitools/openapi-generator-cli` which is required to be installed globally. Accordingly, any client generators and configuration supported by this project are usable via Nest OpenAPI Tools.

# Stay in touch

Author - Kerry Ritter, BeerMoneyDev
Website - https://www.kerryritter.com/, https://www.beermoney.dev/