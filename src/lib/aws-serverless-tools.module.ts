import { Module } from '@nestjs/common';
import { ApiGatewayOpenApi } from './api-gateway-openapi.service';
import { OpenApiFileGeneratorService } from './openapi-file-generator/openapi-file-generator.service';
import { OpenApiAngularClientGeneratorService } from './openapi-angular-client-generator/openapi-angular-client-generator.service';

@Module({
  providers: [
    ApiGatewayOpenApi,
    OpenApiFileGeneratorService,
    OpenApiAngularClientGeneratorService,
  ],
  exports: [
    ApiGatewayOpenApi,
  ]
})
export class AwsServerlessToolsModule {
}
