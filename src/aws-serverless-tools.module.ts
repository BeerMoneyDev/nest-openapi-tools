import { Module } from '@nestjs/common';
import { ApiGatewayOpenApi } from './api-gateway-openapi.service';
import { OpenapiFileGeneratorService } from './openapi-file-generator/openapi-file-generator.service';
import { OpenapiAngularClientGeneratorService } from './openapi-angular-client-generator/openapi-angular-client-generator.service';

@Module({
  providers: [
    ApiGatewayOpenApi,
    OpenapiFileGeneratorService,
    OpenapiAngularClientGeneratorService,
  ],
  exports: [
    ApiGatewayOpenApi,
  ]
})
export class AwsServerlessToolsModule {
}
