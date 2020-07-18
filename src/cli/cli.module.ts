import { Module } from '@nestjs/common';
import { CliService } from './cli.service';
import { InitializeActionService } from './cli-actions/initialize-action.service';
import { CoreModule } from '../core';

@Module({
  imports: [
    CoreModule,
  ],
  providers: [
    CliService,
    InitializeActionService,
  ],
})
export class CliModule {}
