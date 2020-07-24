export interface ApiGatewayOpenApiOptions {
  title: string;
  description: string;
  version: string;
  contact: {
    name: string;
    email: string;
    url: string;
  };
  filePath: string;
  docsWebServerRoot: string;
  apiBaseUrl: string;

  clientOutputFolderPath?: string;
  clientAdditionalProperties?: string;
  clientModulePrefix?: string;
}
