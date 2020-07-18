import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { FileSystemService } from './file-system.service';

@Injectable()
export class NpmService {
  constructor(private readonly fileSystem: FileSystemService) {}

  install() {
    return this.runCommand(`npm install`);
  }

  installPackages(packages: string[], saveFlag: 'save' | 'save-dev') {
    const packagesString = packages.join(' ');
    return this.runCommand(`npm install --${saveFlag} ${packagesString}`);
  }

  cleanInstall() {
    return this.runCommand(`npm ci`);
  }

  runScript(commandName: string, args?: string[]) {
    const cmd = [`npm run ${commandName}`, `--`, ...(args ?? [])].join(' ');
    return this.runCommand(cmd);
  }

  prune(production?: boolean) {
    return this.runCommand(production 
      ? `npm prune --production`
      : `npm prune`);
  }

  private runCommand(cmd: string) {
    return new Promise((resolve, reject) => {
      exec(
        cmd,
        {
          cwd: this.fileSystem.getCwdPath(''),
        },
        (error, stdout, stderr) => {
          if (error) {
            return reject(stderr?.length ? stderr : error);
          }
          resolve(stdout ? stdout : stderr);
        },
      );
    });
  }
}