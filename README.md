<h1 align="center">nest-openapi-tools</h1>
<div align="center">
  <img src="https://beermoneydev-assets.s3.amazonaws.com/nest-openapi-tools-logo.png" />
</div>
<br />
<div align="center">
  <strong>Easily integrate Swagger/OpenAPI with NestJS APIs.</strong>
</div>
<br />
<div align="center">
<a href="https://www.npmjs.com/package/nest-openapi-tools"><img src="https://img.shields.io/npm/v/nest-openapi-tools.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-openapi-tools"><img src="https://img.shields.io/npm/l/nest-openapi-tools.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-openapi-tools"><img src="https://img.shields.io/npm/dm/nest-openapi-tools.svg" alt="NPM Downloads" /></a>
</div>

# Installation

```bash
npm install --save nest-openapi-tools @nestjs/swagger swagger-ui-express
```

# About

This library's goal is to make it as easy as possible to use NestJS with Swagger, also known as OpenAPI. NestJS's Swagger package does not currently generate specification file - rather, it generates the web server with the specification.

This package leverages that tooling to generate a YAML or JSON specification file as well as `@openapitools/openapi-generator-cli` to then generate a client. By using this as part of our development experience, we can build our APIs with NestJS's `npm run start:dev` running and have a new, fully-setup API client ready to go for our consuming layer (whether this is a SPA app or another API service).

# Usage

## Setting up API Definitions in NestJS

The [NestJS OpenAPI docs for @NestJS/Swagger](https://docs.nestjs.com/openapi/introduction) are a fantastic guide to defining your API in code. There are two routes:

1. Using the [CLI Plugin](https://docs.nestjs.com/openapi/cli-plugin). This is recommended as it is very hands-off and easy-to-use. However, it is a bit of a "magic" solution - this can sometimes prove frustrating.
2. Use decorators for [operations](https://docs.nestjs.com/openapi/operations) and [types](https://docs.nestjs.com/openapi/types-and-parameters). This is more hands-on but is concise in what is expected to be produced.

These must be complete in order for Nest OpenAPI Tools to function - this package leverages the NestJS Swagger library to generate the server and specification file. 

## OpenApiNestFactory

The OpenApiNestFactory simplifies the process of:

1. Generating an OpenAPI file from a NestJS API.
2. Generating a client project (i.e. an Axios client or an Angular client module).
3. Starting up the OpenAPI documentation web server.

### How to use

To leverage this functionality, add a call to `OpenApiNestFactory.configure()` call as demonstrated below.

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
import { OpenApiNestFactory } from 'nest-openapi-tools';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await OpenApiNestFactory.configure(
    app, 
    new DocumentBuilder().setTitle('My API'),
  );

  await app.listen(3000);
}
bootstrap();
```

This falls back to all defaults provided by Nest OpenAPI Tools to:

* enable the documentation web server at http://localhost:3000/api-docs
* generate the OpenAPI document at `./openapi.yaml`
* generate a TypeScript Axios HTTP client at `../my-api-client`.

Note that all of these values can be changed as demonstrated in the section below.

### OpenApiNestFactory configuration

These are the default values when no options are passed in to OpenApiNestFactory. To override these, simply use the configuration object (the third argument in the `configure()` call).

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenApiNestFactory } from 'nest-openapi-tools';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await OpenApiNestFactory.configure(app, 
    new DocumentBuilder()
      .setTitle('My API')
      .setDescription('An API to do awesome things')
      .addBearerAuth(),
    {
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

***NOTICE!* File generation and client generation should be disabled in production as they are costly to startup time.**

### Client Generator Options

This project leverages the [OpenAPITools/openapi-generator](https://github.com/OpenAPITools/openapi-generator) project via the npm package, `@openapitools/openapi-generator-cli` which is required to be installed globally. Accordingly, any client generators and configuration supported by this project are usable via Nest OpenAPI Tools.

#### Client Generator Classes

To help with getting started, Nest OpenAPI Tools provides some classes with helpful defaults.

**AxiosClientGeneratorOptions**

* type = 'typescript-axios';
* outputFolderPath = '../typescript-api-client/src';
* additionalProperties = 'apiPackage=clients,modelPackage=models,withoutPrefixEnums=true,withSeparateModelsAndApi=true';
* openApiFilePath = './openapi.yaml';

# Stay in touch

Author - Kerry Ritter, BeerMoneyDev

Website - https://www.kerryritter.com/, https://www.beermoney.dev/