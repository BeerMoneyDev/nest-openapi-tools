import { Module } from '@nestjs/common';
import { CoreModule, CloudFormationService, FileSystemService, NpmService } from '../core';

@Module({
  providers: [
    CloudFormationService,
    FileSystemService,
    NpmService,
  ],
  exports: [
    CloudFormationService,
    FileSystemService,
    NpmService,
  ],
})
export class DeployToolsModule {}
