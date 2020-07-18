import cli, { ActionBase } from 'cli-ux'
import { NestFactory } from '@nestjs/core';
import { DeployToolsModule } from './deploy-tools.module';
import { NpmService, FileSystemService, CloudFormationService } from '../core';

interface Services {
  npm: NpmService;
  fileSystem: FileSystemService;
  cfn: CloudFormationService;
  cli: {
    action: ActionBase;
    error: (input: string | Error, options?: {
        exit?: number;
    }) => never;
  };
}

export async function runDeployment(action: (services: Services) => Promise<unknown>) {
  const app = await NestFactory.createApplicationContext(DeployToolsModule, {
    logger: false,
  });

  await action({
    cli,
    npm: app.get(NpmService),
    fileSystem: app.get(FileSystemService),
    cfn: app.get(CloudFormationService),
  })
};

export async function runDeploymentStep(options: {
  stepName: string,
  continueOnError?: boolean,
  disable?: true,
  action: () => Promise<unknown>,
}) {
  if (options?.disable) {
    if (options?.stepName?.length) {
      cli.action.start(`Skipping step ${options.stepName}...`);
    }
    return;
  }

  try {
    if (options?.stepName?.length) {
      cli.action.start(`Running step ${options.stepName}...`);
    }

    await options.action();
  } catch (ex) {
    cli.error(`Error running step ${options.stepName}: ${ex}`, { exit: false });

    if (!options.continueOnError) {
      throw ex;
    }
  } finally {
    cli.action.stop();
  }
}