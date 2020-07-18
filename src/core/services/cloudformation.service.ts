import cli from 'cli-ux';
import { Subject } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
const cfnDeploy = require('cfn-deploy');

export interface CloudFormationDeployEvent {
  status: 'started' | 'progress' | 'error' | 'complete';
  details?: any;
}

export interface CloudFormationDeployOptions {
  stackname: string;
  region: string;
  template: string;
  parameters: string;
  tags: string;
  profile?: string;
  capabilities?: string;
}

export interface CloudFormationDeleteOptions {
  stackname: string;
  profile?: string;
}

export interface CloudFormationPackageOptions {
  packageBucket: string;
  profile: string;
  templateFilePath: string;
  outputFilePath: string;
}

@Injectable()
export class CloudFormationService {
  async package(options: CloudFormationPackageOptions) {
    const command = [
      `aws cloudformation package`,
      `--template-file "${options.templateFilePath}"`,
      `--s3-bucket ${options.packageBucket}`,
      `--output-template-file "${options.outputFilePath}"`,
      options.profile?.length ? `--profile ${options.profile}` : ``,
    ].join(' ');

    await this.runCommand(command);
  }

  deploy(options: CloudFormationDeployOptions) {
    const eventStream = cfnDeploy(options);

    const progress = new Subject<CloudFormationDeployEvent>();

    const promise = new Promise((resolve, reject) => {
      eventStream.on('EXECUTING_CHANGESET', () => {
        progress.next({ status: 'progress' });
      });
      eventStream.on('COMPLETE', () => {
        progress.next({ status: 'complete' });
        resolve();
      });
      eventStream.on('ERROR', async (err: any) => {
        progress.next({ status: 'error', details: err });

        const errorMessage = JSON.stringify(err);
        if ([
            'Resource is not in the state',
            `Can't update stack when status is`,
          ].some(x => errorMessage.includes(x))
          && await cli.confirm(`Stack in an invalid state. Delete stack?`)) {
          await this.deleteStack(options);
          return this.deploy(options);
        } else {
          reject(err);
        }
      });

      progress.next({ status: 'started' });
    });

    return {
      progress,
      promise,
    };
  }

  async deleteStack(options: CloudFormationDeleteOptions) {
    const command = [
      `aws cloudformation delete-stack`,
      `--stack-name kerry-test`,
      options.profile?.length ? `--profile ${options.profile}` : ``,
    ].join(' ');

    await this.runCommand(command);
  }

  private runCommand(cmd: string) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.warn(error);
        }
        resolve(stdout ? stdout : stderr);
      });
    });
  }
}