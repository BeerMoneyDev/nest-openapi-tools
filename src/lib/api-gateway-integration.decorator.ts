import { ApiExtension } from '@nestjs/swagger';

export const ApiGatewayIntegration = (lambdaFunctionResourceName?: string) => {
  lambdaFunctionResourceName =
    lambdaFunctionResourceName ?? process.env.LAMBDA_FUNCTION_RESOURCE_NAME;

  const subArn = [
    'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/',
    `arn:aws:lambda:\${AWS::Region}:\${AWS::AccountId}:function:\${${lambdaFunctionResourceName}}/invocations`,
  ].join('');

  return ApiExtension('x-amazon-apigateway-integration', {
    type: 'aws_proxy',
    httpMethod: 'POST',
    uri: {
      'Fn::Sub': subArn,
    },
  });
};
