import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class OpenApiAngularClientGeneratorService {
  async generateAngularClient(
    openApiFilePath: string,
    clientOutputFolderPath: string,
    additionalProperties: string,
  ) {
    if (!clientOutputFolderPath?.length) {
      throw new Error('Angular client output directory was not set.');
    }

    await new Promise(resolve => {
      const command = [
        `java ${process.env['JAVA_OPTS'] || ''}`,
        `-jar "./node_modules/@openapitools/openapi-generator-cli/bin/openapi-generator.jar"`,
        `generate`,
        `-g typescript-angular`,
        `-i ${openApiFilePath}`,
        `-o ${clientOutputFolderPath}`,
        `--additional-properties=\"${additionalProperties}\"`,
      ].join(' ');

      const cmd = spawn(command, { stdio: 'inherit', shell: true });
      cmd.on('exit', resolve);
    });

    return this;
  }
}
