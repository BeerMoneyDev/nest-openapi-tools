import { Injectable } from '@nestjs/common';
import { argv } from 'yargs';
import { InitializeArgs } from './cli-actions/initialize/initialize-action.service';

enum CliAction {
  Initialize = 'init',
  Generate = 'generate',
}

@Injectable()
export class CliService {
  parseArgs() {
    const action = argv._?.[0]?.toLocaleLowerCase() as CliAction;

    if (action === 'init') {
      return {
        action,
        args: {
          type: argv.type as any,
        } as InitializeArgs,
      };
    }
    return { action };
  }
}
