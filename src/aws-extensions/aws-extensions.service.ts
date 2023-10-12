import { Injectable } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';

export interface AwsExtensionsOptions {
  enabled: boolean;
  apiGatewayExtensionOptions?: {
    enabled: boolean;
    lambdaResourceName: string;
    vpceIdParamName?: string;
    addPolicy?: boolean;
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
              'arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/',
              'arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:',
              `\${${options.apiGatewayExtensionOptions.lambdaResourceName}}/invocations`,
            ].join(''),
          },
        };
      });
    });
  }

  addVpceServerExtension(
    options: AwsExtensionsOptions,
    openApiDoc: OpenAPIObject,
  ) {
    const openApiDocServers = openApiDoc.servers || [];
    if (
      !openApiDocServers.find(
        server => server['x-amazon-apigateway-endpoint-configuration'],
      )
    ) {
      openApiDoc.servers.push({
        'x-amazon-apigateway-endpoint-configuration': {
          vpcEndpointIds: [
            { 'Fn::Ref': options.apiGatewayExtensionOptions?.vpceIdParamName },
          ],
        },
      } as any);
    }
  }

  addApiGatewayPolicyExtension(
    options: AwsExtensionsOptions,
    openApiDoc: OpenAPIObject,
  ) {
    const policyExtension = openApiDoc['x-amazon-apigateway-policy'];
    if (!policyExtension) {
      openApiDoc['x-amazon-apigateway-policy'] = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 'execute-api:Invoke',
            Resource: '*',
          },
        ],
      };
    }
  }
}
