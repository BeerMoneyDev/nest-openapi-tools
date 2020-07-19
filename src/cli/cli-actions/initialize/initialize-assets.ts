import { stringify } from 'yaml';

export const createCloudFormationContents = (appName: string) => {
  const roleResourceName = `${appName}Role`;
  const lambdaResourceName = `${appName}Lambda`;
  const apiResourceName = `${appName}Api`;
  const gatewayPermissionResourceName = `${appName}GatewayPermission`;

  const roleResource = {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: `!Sub ${apiResourceName}-\${Environment}`,
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: ['lambda.amazonaws.com'],
            },
            Action: ['sts:AssumeRole'],
          },
        ],
      },
      Path: '/',
      ManagedPolicyArns: [
        'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
      ],
    },
  };

  const lambdaResource = {
    Type: 'AWS::Serverless::Function',
    Properties: {
      Handler: 'dist/lambda-entry-point.handler',
      Runtime: 'nodejs12.x',
      CodeUri: 'artifacts.zip',
      MemorySize: 512,
      Timeout: 900,
      Role: `!GetAtt ${roleResourceName}.Arn`,
      Environment: {
        Variables: {
          ENVIRONMENT: '!Ref Environment',
          NODE_ENV: '!Ref Environment',
          LAMBDA_FUNCTION_RESOURCE_NAME: `${lambdaResourceName}`,
        },
      },
    },
  };

  const apiResource = {
    Type: 'AWS::Serverless::Api',
    DependsOn: lambdaResourceName,
    Properties: {
      Name: `!Sub ${apiResourceName}-\${Environment}`,
      StageName: '!Ref Environment',
      DefinitionBody: {
        'Fn::Transform': {
          Name: 'AWS::Include',
          Parameters: {
            Location: 'swagger.yaml',
          },
        },
      },
      EndpointConfiguration: 'EDGE',
    },
  };

  const gatewayPermissionResource = {
    Type: 'AWS::Lambda::Permission',
    Properties: {
      Action: 'lambda:InvokeFunction',
      FunctionName: `!Ref ${lambdaResourceName}`,
      Principal: 'apigateway.amazonaws.com',
      SourceArn: `__PERMISSION_SOURCE_ARN__`,
    },
  };

  const cfn = {
    AWSTemplateFormatVersion: '2010-09-09',
    Transform: 'AWS::Serverless-2016-10-31',
    Description:
      'An AWS Serverless API for managing canary deployments for LCS UI',
    Parameters: {
      Environment: {
        Type: 'String',
        Description: 'Environment; dev, sit, stg, prod',
        AllowedValues: ['dev', 'sit', 'stg', 'prod'],
      },
    },
    Resources: {},
  };

  cfn.Resources[roleResourceName] = roleResource;
  cfn.Resources[lambdaResourceName] = lambdaResource;
  cfn.Resources[apiResourceName] = apiResource;
  cfn.Resources[gatewayPermissionResourceName] = gatewayPermissionResource;

  const pureYaml = stringify(cfn, { indentSeq: false });
  const cfnYaml = pureYaml
    .replace(/\"\!Sub /g, '!Sub "')
    .replace(/\"\!Ref (.*)\"/g, '!Ref $1')
    .replace(/\"\!GetAtt (.*)\"/g, '!GetAtt $1')
    .replace(
      '__PERMISSION_SOURCE_ARN__',
      `!Sub "arn:aws:execute-api:\${AWS::Region}:\${AWS::AccountId}:\${${apiResourceName}}/\${Environment}/*"`,
    );

  return cfnYaml;
};

export const createSwaggerContents = (stackName: string) => {
  return `openapi: 3.0.0
  info:
    title: ${stackName}
  x-amazon-apigateway-gateway-responses:
    DEFAULT_4XX:
      responseParameters:
        gatewayresponse.header.Access-Control-Allow-Origin: "'*'"
      responseTemplates:
        application/json: '{"message":$context.error.messageString}'
    DEFAULT_5XX:
      responseParameters:
        gatewayresponse.header.Access-Control-Allow-Origin: "'*'"
      responseTemplates:
        application/json: '{"message":$context.error.messageString}'
  x-amazon-apigateway-policy:
    Version: '2012-10-17'
    Statement:
      - Effect: Allow
        Principal: "*"
        Action: execute-api:Invoke
        Resource:
          - "*"
`;
};

export const createGitIgnoreContents = () =>
  [`artifacts.zip`, `*-transformed.yaml`].join('\n');

export const createDeployScriptContents = (
  stackName: string,
  uploadResourceBucket: string,
  profile: string,
  region: string,
) => {
  return `const { runDeployment, runDeploymentStep } = require('nest-aws-serverless-tools');

runDeployment(async ({ fileSystem, npm, cfn }) => {
  await runDeploymentStep({
    stepName: 'Clearing artifacts',
    action: () => fileSystem.delete('cfn/artifacts.zip'),
    disable: true,
  });

  await runDeploymentStep({
    stepName: 'Running clean NPM install',
    action: () => npm.cleanInstall(),
    disable: true,
  });

  await runDeploymentStep({
    stepName: 'Running lint',
    action: () => npm.runScript('lint'),
    disable: true,
  });

  await runDeploymentStep({
    stepName: 'Running build',
    action: () => npm.runScript('build'),
    disable: true,
  });

  await runDeploymentStep({
    stepName: 'Running prune',
    action: () => npm.prune(true),
    disable: true,
  });

  await runDeploymentStep({
    stepName: 'Zipping artifacts',
    action: () => fileSystem.zipFolder([
      fileSystem.getCwdPath('node_modules'),
      fileSystem.getCwdPath('dist')
    ],
      fileSystem.getCwdPath('cfn/artifacts.zip')
    ),
    disable: true,
  });

  await runDeploymentStep({
    stepName: 'Packaging',
    action: () => cfn.package({
      templateFilePath: fileSystem.getCwdPath('cfn/cloudformation.yaml'),
      outputFilePath: fileSystem.getCwdPath('cfn/cloudformation-transformed.yaml'),
      packageBucket: '${uploadResourceBucket}',
      profile: '${profile}',
    }),
    // disable: true,
  });

  await runDeploymentStep({
    stepName: 'Deploying',
    action: () => cfn.deploy({
      stackname: '${stackName}',
      parameters: [fileSystem.getCwdPath('cfn/parameters-dev.json')],
      tags: [fileSystem.getCwdPath('cfn/tags.json')],
      profile: '${profile}',
      region: '${region}',
      template: fileSystem.getCwdPath('cfn/cloudformation-transformed.yaml'),
      capabilities: 'CAPABILITY_NAMED_IAM',
    }).promise,
    // disable: true,
  });
});
`;
};

export const createParametersFileContents = (env: string) => {
  return JSON.stringify([
    {
      ParameterKey: 'Environment',
      ParameterValue: env,
    },
  ]);
};

export const createTagsFileContents = (appName: string) => {
  return JSON.stringify([
    {
      Key: 'App',
      Value: appName,
    },
  ]);
};

export const createLambdaEntryPoint = () => {
  return `import { AppModule } from './app.module';
import { createExpressHandler } from 'nest-aws-serverless-tools';

export const handler = createExpressHandler(AppModule);`;
};
