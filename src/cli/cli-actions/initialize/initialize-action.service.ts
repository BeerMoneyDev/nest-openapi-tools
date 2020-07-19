import { Injectable } from '@nestjs/common';
import { NpmService, FileSystemService } from '../../../core';
import * as assets from './initialize-assets';
import { join } from 'path';
import { cli } from 'cli-ux';

export interface InitializeArgs {
  type: 'nest-express-api';
}

@Injectable()
export class InitializeActionService {
  constructor(
    private readonly npm: NpmService,
    private readonly fileService: FileSystemService,
  ) {}

  async run(args: InitializeArgs) {
    if (args.type === 'nest-express-api' || true) {
      await this.initializeNestExpress();
    }
  }

  private async initializeNestExpress() {
    const appName = await this.getAppName();
    const stackName = await this.getStackName(appName);
    const region = await this.getRegion();
    const profile = await this.getProfile();
    const resourceBucket = await this.getResourceBucket();

    this.fileService.createDirectory(this.fileService.getCwdPath('cfn'));

    const files: Array<[string, string]> = [
      [join('cfn', '.gitignore'), assets.createGitIgnoreContents()],
      [
        join('cfn', 'cloudformation.yaml'),
        assets.createCloudFormationContents(appName),
      ],
      [
        join('cfn', 'openapi.yaml'),
        assets.createSwaggerContents(stackName),
      ],
      [
        join('cfn', 'deploy.js'),
        assets.createDeployScriptContents(
          stackName,
          resourceBucket,
          profile,
          region,
        ),
      ],
      [
        join('cfn', 'parameters-dev.json'),
        assets.createParametersFileContents('dev'),
      ],
      [join('cfn', 'tags.json'), assets.createTagsFileContents(appName)],
      [join('src', 'lambda-entry-point.ts'), assets.createLambdaEntryPoint()],
    ];

    for (const [fileName, fileContents] of files) {
      cli.action.start(`Creating ${fileName}...`);
      this.fileService.writeFile(
        this.fileService.getCwdPath(fileName),
        fileContents,
      );
      cli.action.stop(`Created ${fileName}!`);
    }

    const packages = [
      `nest-aws-serverless-tools`,
      `aws-lambda@^1.0.6`,
      `aws-serverless-express@^3.3.8`,
      `@nestjs/common@^7.0.0`,
      "@nestjs/config@^0.5.0",
      `@nestjs/core@^7.0.0`,
      `@nestjs/platform-express@^7.3.2`,
      `@nestjs/swagger@^4.5.12`,
      `swagger-ui-express@^4.1.4`,
    ];
    cli.action.start(`Running "npm install --save ${packages.join(' ')}"...`);
    await this.npm.installPackages(packages, 'save');
    cli.action.stop('Install complete!');

    cli.action.start('Updating package.json scripts and config...');
    this.npm.addScript('deploy', 'node ./cfn/deploy');
    this.npm.addScript('openapi', 'ts-node src/main --openapi-generate');
    this.npm.addTopLevelConfig('openApi', {
      filePath: './cfn/openapi.yaml',
      clientOutputFolderPath: './angular-client/',
      clientAdditionalProperties: [
        `apiModulePrefix=${appName}`,
        `fileNaming=kebab-case`,
        `stringEnums=true`,
        `taggedUnions=true`,
      ].join(','),
    });
    this.npm.addTopLevelConfig('cfnLambdaParamsConfig', {
      cfnFilePath: './cfn/cloudformation.yaml',
      lambdaResourceName: `${appName}Lambda`,
      parametersFilePath: "./cfn/parameters-dev.json"
    });
    cli.action.start('Completed package.json update!');
  }

  private async getAppName() {
    // TODO: pull a default from package.json
    return await cli.prompt('App Name (PascalCase)');
  }

  private async getStackName(appName: string) {
    const stackName = await cli.prompt(`Stack Name (kebab-case)`, {
      required: false,
      default: appName
        .replace(/([A-Z])([A-Z])/g, '$1-$2')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase(),
    });

    return stackName;
  }

  private async getRegion() {
    const validOptions = [
      `us-east-1`,
      `us-east-2`,
      `us-west-1`,
      `us-west-2`,
      `eu-north-1`,
      `eu-central-1`,
      `eu-west-1`,
      `eu-west-2`,
      `eu-west-3`,
      `ap-south-1`,
      `ap-southeast-1`,
      `ap-southeast-2`,
      `ap-northeast-1`,
      `ap-northeast-2`,
      `ap-northeast-3`,
      `sa-east-1`,
      `ca-central-1`,
    ];

    let input = (await cli.prompt('Region'))?.toLowerCase()?.trim();
    while (!validOptions.includes(input)) {
      input = (await cli.prompt('Invalid input. Region'))
        ?.toLowerCase()
        ?.trim();
    }

    return input;
  }

  private async getResourceBucket() {
    // TODO: offer a creation
    return await cli.prompt(
      'Name of S3 bucket for uploading deployment resources',
    );
  }

  private async getProfile() {
    // TODO: parse the currently registered profiles on the machine
    const input = (
      await cli.prompt('AWS Credentials Profile (blank if default)', {
        required: false,
      })
    )?.trim();
    return input?.length ? input : null;
  }
}
