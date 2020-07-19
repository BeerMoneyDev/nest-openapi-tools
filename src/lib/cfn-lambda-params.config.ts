import { readFileSync, existsSync } from 'fs';
import { parseDocument } from 'yaml';
import { readPackageJson } from './package-json-reader';

type ParamsFile = Array<{ ParameterKey: string; ParameterValue: string }>;

interface CloudFormationDefinition {
  Resources?: {
    [key: string]: {
      Properties: {
        Environment?: {
          Variables?: {
            [key: string]: string;
          };
        };
      };
    };
  };
}

export const CloudFormationLambdaParametersConfig = () => {
  const packageJson = readPackageJson<{
    cfnLambdaParamsConfig: {
      cfnFilePath: string;
      parametersFilePath: string;
      lambdaResourceName: string;
    };
  }>();

  const {
    cfnFilePath,
    parametersFilePath,
    lambdaResourceName,
  } = packageJson?.cfnLambdaParamsConfig;

  if (!existsSync(cfnFilePath) || !existsSync(parametersFilePath)) {
    console.log(
      'Invalid cfnFilePath or parametersFilePath. Backing out cfnLambdaParamsConfig.',
    );
    return {};
  }

  const params: ParamsFile = JSON.parse(
    readFileSync(parametersFilePath).toString(),
  );
  const cfnDetails: CloudFormationDefinition = cfnFilePath
    ?.toLocaleLowerCase()
    ?.endsWith('.yaml')
    ? parseDocument(readFileSync(cfnFilePath).toString()).toJSON()
    : JSON.parse(readFileSync(cfnFilePath).toString());

  const config = {};

  const envVars =
    cfnDetails?.Resources?.[lambdaResourceName]?.Properties?.Environment
      ?.Variables ?? {};

  Object.keys(envVars).forEach(envKey => {
    const paramKey = envVars[envKey];
    const configValue = params.find(p => p.ParameterKey === paramKey)
      ?.ParameterValue;
    config[envKey] = configValue;
  });

  return config;
};
