import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { INestApplication, Injectable } from '@nestjs/common';
import { ApiGatewayOpenApiOptions } from './api-gateway-openapi-options.interface';
import { OpenApiFileGeneratorService } from './openapi-file-generator/openapi-file-generator.service';
import { OpenApiAngularClientGeneratorService } from './openapi-angular-client-generator/openapi-angular-client-generator.service';
import { readPackageJson } from './package-json-reader';

@Injectable()
export class ApiGatewayOpenApi {
  document: OpenAPIObject;

  private options: ApiGatewayOpenApiOptions;

  private get isGenerateCommand() {
    return process.argv?.some(
      a => a?.trim()?.toLocaleLowerCase() === '--openapi-generate',
    );
  }

  private app: INestApplication;
  private overrideDocOptions?: ApiGatewayOpenApiOptions;
  private openApiFileDocExtensions?: any;
  private customOptionsModifier?: (options: DocumentBuilder) => void;

  constructor(
    private readonly openApiFileGenerator: OpenApiFileGeneratorService,
    private readonly openApiAngularClientGenerator: OpenApiAngularClientGeneratorService,
  ) {
  }

  setNestAppContext(
    app: INestApplication,
    overrideDocOptions?: ApiGatewayOpenApiOptions,
    openApiFileDocExtensions?: any,
    customOptionsModifier?: (options: DocumentBuilder) => void,
  ) {
    this.app = app;
    this.overrideDocOptions = overrideDocOptions;
    this.openApiFileDocExtensions = openApiFileDocExtensions;
    this.customOptionsModifier = customOptionsModifier;
    return this;
  }

  async handleGenerateCommand(
    generateOpenApiFile: boolean,
    generateAngularClient: boolean,
  ) {
    if (!this.isGenerateCommand) {
      return false;
    }

    if (generateOpenApiFile) {
      await this.generateOpenApiFile();
    }

    if (generateAngularClient) {
      await this.generateAngularClient();
    }

    return true;
  }

  async enableDocumentationWebServer() {
    await this.lazyInitialize();

    SwaggerModule.setup(
      this.options.docsWebServerRoot ?? 'apidocs',
      this.app,
      this.document,
    );

    return this;
  }

  async generateOpenApiFile() {
    await this.lazyInitialize();

    await this.openApiFileGenerator.generateOpenApiFile(
      this.options?.filePath,
      this.document,
    );
  }

  async generateAngularClient() {
    await this.lazyInitialize();

    await this.openApiAngularClientGenerator.generateAngularClient(
      this.options.filePath,
      this.options.clientOutputFolderPath,
      this.options.clientAdditionalProperties
    );

    return this;
  }

  private async lazyInitialize() {
    if (!this.app) {
      throw new Error('Nest application context was not set.');
    }

    if (!this.options) {
      await this.loadDocOptions();
    }

    if (!this.document) {
      this.setupSwaggerDocument();
    }
  }

  private async loadDocOptions() {
    const packageJsonDocOptions = await this.parsePackageJson();
    this.options = {
      ...packageJsonDocOptions,
      ...this.overrideDocOptions,
    };
  }

  private async parsePackageJson(): Promise<ApiGatewayOpenApiOptions> {
    const packageJson = readPackageJson<{
      name: string,
      description: string,
      author: string,
      version: string,
      openApi: {
        docsWebServerRoot: string,
        filePath: string,
        apiBaseUrl: string,
        clientOutputFolderPath: string,
        clientModulePrefix: string,
        clientAdditionalProperties: string,
      }
    }>();

    const authorSplits = packageJson.author?.split(' ');
    const authorName =
      authorSplits
        ?.filter(as => !as?.includes('<') && !as?.includes('('))
        ?.join(' ') ?? '';
    const authorEmail =
      authorSplits
        ?.find(as => as.startsWith('<') && as.endsWith('>'))
        ?.replace('<', '')
        ?.replace('>', '') ?? '';
    const authorUrl =
      authorSplits
        ?.find(as => as.startsWith('(') && as.endsWith(')'))
        ?.replace('(', '')
        ?.replace(')', '') ?? '';

    return {
      title: packageJson.name,
      description: packageJson.description,
      version: packageJson.version,
      contact: {
        name: authorName,
        email: authorEmail,
        url: authorUrl,
      },
      docsWebServerRoot: packageJson?.openApi?.docsWebServerRoot,
      filePath: packageJson?.openApi?.filePath,
      apiBaseUrl: packageJson?.openApi?.apiBaseUrl,

      clientOutputFolderPath: packageJson?.openApi?.clientOutputFolderPath,
      clientModulePrefix: packageJson?.openApi?.clientModulePrefix,
      clientAdditionalProperties:
        packageJson?.openApi?.clientAdditionalProperties,
    };
  }

  private setupSwaggerDocument() {
    const options = new DocumentBuilder()
      .setTitle(this.options?.title)
      .setDescription(this.options?.description)
      .setVersion(this.options?.version ?? '1.0')
      .setContact(
        this.options?.contact?.name,
        this.options?.contact?.url,
        this.options?.contact?.email,
      )
      .setLicense(
        'Apache 2.0',
        'http://www.apache.org/licenses/LICENSE-2.0.html',
      )
      .addServer(this.options?.apiBaseUrl ?? 'https://virtserver.swaggerhub.com')
      .addTag(this.options?.title, this.options?.description);

    if (this.customOptionsModifier) {
      this.customOptionsModifier(options);
    }

    this.document = SwaggerModule.createDocument(
      this.app,
      this.attachDocExtension(options.build()),
    );
  }

  private attachDocExtension(options: any) {
    const awsExtensions = {
      'x-amazon-apigateway-gateway-responses': {
        DEFAULT_4XX: {
          responseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
          },
          responseTemplates: {
            'application/json': '{"message":$context.error.messageString}',
          },
        },
        DEFAULT_5XX: {
          responseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
          },
          responseTemplates: {
            'application/json': '{"message":$context.error.messageString}',
          },
        },
      },
      'x-amazon-apigateway-policy': {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 'execute-api:Invoke',
            Resource: ['*'],
          },
        ],
      },
    };

    return {
      ...options,
      ...awsExtensions,
      ...this.openApiFileDocExtensions,
    };
  }
}
