import { Injectable } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';

export interface AwsExtensionsOptions {
  enabled: boolean;
  apiGatewayExtensionOptions?: {
    enabled: boolean;
    lambdaResourceName: string;
  };
}

@Injectable()
export class AwsExtensionsService {
  addApiGatewayIntegrations(
    options: AwsExtensionsOptions,
    openApiDoc: OpenAPIObject,
  ) {
    const routeKeys = Object.keys(openApiDoc.paths);
    routeKeys.forEach(routeKey => {
      const methodKeys = Object.keys(openApiDoc.paths[routeKey]);
      methodKeys.forEach(methodKey => {
        openApiDoc.paths[routeKey][methodKey][
          'x-amazon-apigateway-integration'
        ] = {
          type: 'AWS_PROXY',
          httpMethod: 'POST',
          uri: {
            'Fn::Sub': [
              'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/',
              'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:',
              `\${${options.apiGatewayExtensionOptions.lambdaResourceName}}/invocations`,
            ].join(''),
          },
        };
      });
    });
  }
}
