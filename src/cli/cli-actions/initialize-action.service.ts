import { Injectable } from '@nestjs/common';
import { NpmService, FileSystemService } from '../../core';

@Injectable()
export class InitializeActionService {
  constructor(
    private readonly npm: NpmService,
    private readonly fileService: FileSystemService,
  ) {
  }

  async installRequirements() {
    await this.npm.installPackages([
      `aws-lambda@^1.0.6`,
      `aws-serverless-express@^3.3.8`,
      `@nestjs/common@^7.0.0`,
      `@nestjs/core@^7.0.0`,
      `@nestjs/platform-express@^7.3.2`,
      `@nestjs/swagger@^4.5.12`,
      `swagger-ui-express@^4.1.4`
    ], 'save');
    
  }
}
