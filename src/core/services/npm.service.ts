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
    return this.runCommand(production ? `npm prune --production` : `npm prune`);
  }

  addScript(key: string, command: string) {
    try {
      const packageJson = JSON.parse(this.fileSystem.readFile('package.json'));
      packageJson.scripts = packageJson.scripts ?? {};
      packageJson.scripts[key] = command;
      this.fileSystem.writeFile(
        'package.json',
        JSON.stringify(packageJson, null, 2),
      );
    } catch (e) {
      if (e.message?.includes('ENOENT, no such file or directory')) {
        throw new Error('You are not in a package.json folder.');
      } else {
        throw e;
      }
    }
  }

  addTopLevelConfig(key: string, object: any) {
    try {
      const packageJson = JSON.parse(this.fileSystem.readFile('package.json'));
      packageJson[key] = object;
      this.fileSystem.writeFile(
        'package.json',
        JSON.stringify(packageJson, null, 2),
      );
    } catch (e) {
      if (e.message?.includes('ENOENT, no such file or directory')) {
        throw new Error('You are not in a package.json folder.');
      } else {
        throw e;
      }
    }
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
