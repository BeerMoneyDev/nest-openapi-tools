import { Injectable } from '@nestjs/common';
import { argv } from 'yargs';

enum CliAction {
  Initialize = 'init',
  Generate = 'generate',
}

@Injectable()
export class CliService {
  parseArgs() {
    console.log({ argv });
    const action = argv._?.[0]?.toLocaleLowerCase() as CliAction;

    return { action };
  }
}
