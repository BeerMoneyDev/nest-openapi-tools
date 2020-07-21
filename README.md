# Nest AWS Serverless Tools

In alpha mode. Maybe pre-alpha. Docs coming soon.

#### Installation

If you did not use the `init` process from the `@aws-serverless-tools/cli` package, the tools package can be installed directly:

`npm install --save @aws-serverless-tools/cli`

### AwsServerlessToolsModule

This module simplifies the following:

1. Enabling an OpenAPI documentation web server side-by-side with your API (at `/apidocs` by default).
2. Generating an OpenAPI specification file.
3. Generating an Angular client module.

#### Setup

##### Module import

First, import the module into your AppModule.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsServerlessToolsModule } from 'nest-aws-serverless-tools';

@Module({
  imports: [
    AwsServerlessToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Once imported, update the `main.ts` file to retrieve the `ApiGatewayOpenApi` service and start the document server.

##### Generation - Option A: Always generate on bootstrap

With this approach, every build will update the OpenAPI specification file and generate an Angular client.

```ts
// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiGatewayOpenApi } from 'nest-aws-serverless-tools';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const openApi = await app.get(ApiGatewayOpenApi)
    .setNestAppContext(app)
    .enableDocumentationWebServer();
  await openApi.generateOpenApiFile();
  await openApi.generateAngularClient();

  await app.listen(3000);
}
bootstrap();
```

##### Generation - Option B: Only generate when the --openapi-generate flag is used (i.e. in `npm run openapi`)

This is the recommended option. This will generate the OpenAPI specification file and Angular client but only when --openapi-generate is passed to the command.

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiGatewayOpenApi } from 'nest-aws-serverless-tools';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const openApi = await app.get(ApiGatewayOpenApi)
    .setNestAppContext(app)
    .enableDocumentationWebServer();

  if (!(await openApi.handleGenerateCommand(true, true))) {
    await app.listen(3000);
  }
}
bootstrap();
```

#### Configuration

In `package.json`, there are the following configuration options pre-enabled:

```json
{
  "openApi": {
    "filePath": "./cfn/openapi.yaml",
    "clientOutputFolderPath": "./angular-client/",
    "clientAdditionalProperties": "apiModulePrefix=KerryTest,fileNaming=kebab-case,stringEnums=true,taggedUnions=true"
  }
}
```

* **docsWebServerRoot**: The root at which to run the OpenAPI webserver. Default: "apidocs".
* **filePath**: The path to the OpenAPI specification file.
* **apiBaseUrl**: The host or base URL to the API for the Angular client to use by default.
* **clientOutputFolderPath**: The relative path to the Angular client output.;
* **clientModulePrefix**: The prefix of the Angular module, i.e. `${clientModulePrefix}ApiModule`.
* **clientAdditionalProperties**: Additional Angular client generation configuration. See https://openapi-generator.tech/docs/generators/typescript-angular/ for more options.


### CloudFormationLambdaParametersConfig

When running your Lambda in AWS, you'll likely environment variables for configuration. However, maintaining these variables in `process.env` can be cumbersome. 

`CloudFormationLambdaParametersConfig` is a loader for the `@nestjs/config` package to look at your CloudFormation file, cross-reference your Lambda environment variables to a specified parameters file, and make them available via the `nestjs/config` ConfigService.

Note that since this uses `@nestjs/config`, you are free to use `.env` files or any other configuration you see fit for secrets or other configuration options not managed via parameters.

#### Setup

##### ConfigModule Import

Add the `@nestjs/config` ConfigModule to your AppModule imports.

```ts
// main.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsServerlessToolsModule, CloudFormationLambdaParametersConfig } from 'nest-aws-serverless-tools';

@Module({
  imports: [
    AwsServerlessToolsModule,
    ConfigModule.forRoot({
      load: [CloudFormationLambdaParametersConfig],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Stay in touch

- Author - [Kerry Ritter](http://kerryritter.com)
- Twitter - [@kerryritter](https://twitter.com/kerryritter)

## License

  Nest is [MIT licensed](LICENSE).
