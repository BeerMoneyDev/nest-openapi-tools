import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

export interface OpenApiClientGeneratorOptions {
  enabled: boolean;
  type: string;
  openApiFilePath: string;
  outputFolderPath: string;
  additionalProperties?: string;
  skipValidation?: boolean;
}

@Injectable()
export class OpenApiClientGeneratorService {
  async generateClient(options: OpenApiClientGeneratorOptions) {
    if (!options.outputFolderPath?.length) {
      throw new Error('Client output directory was not set.');
    }

    await new Promise((resolve, reject) => {
      const command = [
        `npx openapi-generator-cli generate`,
        `-g ${options.type}`,
        `-i \"${options.openApiFilePath}\"`,
        `-o \"${options.outputFolderPath}\"`,
        options?.additionalProperties?.length
          ? `--additional-properties=\"${options.additionalProperties}\"`
          : '',
        options?.skipValidation ? `--skip-validate-spec` : '',
      ].join(' ');

      const cmd = spawn(command, { stdio: 'inherit', shell: true });
      cmd.on('error', () =>
        reject(
          `Error running openapi-generator-cli command. Is '@openapitools/openapi-generator-cli' installed globally?`,
        ),
      );
      cmd.on('exit', resolve);
    });

    return this;
  }
}
