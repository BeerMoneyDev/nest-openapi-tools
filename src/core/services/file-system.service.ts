import { Injectable } from '@nestjs/common';
import * as archiver from 'archiver';
import * as rimraf from 'rimraf';
import { createWriteStream, renameSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, sep } from 'path';

@Injectable()
export class FileSystemService {
  get cwd() {
    return process.cwd();
  }

  getCwdPath(path?: string) {
    return join(this.cwd, path);
  }

  delete(path: string) {
    return new Promise((res, rej) => rimraf(path, (e) => (e ? rej(e) : res())));
  }

  rename(sourceFolder: string, destinationFolder: string) {
    return renameSync(sourceFolder, destinationFolder);
  }

  exists(sourceFolder: string) {
    return existsSync(sourceFolder);
  }

  createDirectory(folder: string) {
    if (existsSync(folder)) {
      return;
    }
  
    mkdirSync(folder);
  }

  createFile(filePath: string, contents: string) {
    writeFileSync(filePath, contents);
  }

  zipFolder(sourceFolders: string[], destinationZip: string) {
    const output = createWriteStream(destinationZip);
    const archive = archiver('zip');

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      sourceFolders.forEach(sf => {
        archive.directory(sf, sf.split(sep).pop())
      });
      archive.finalize();
    });
  }
}