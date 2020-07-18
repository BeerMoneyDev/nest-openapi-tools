import { Module } from '@nestjs/common';
import { CloudFormationService, FileSystemService, NpmService } from './services';

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
export class CoreModule {}
