import { NestFactory } from '@nestjs/core';
import { CliModule } from './cli.module';
import { CliService } from './cli.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: false,
  });

  const cliService = app.get(CliService);
  cliService.parseArgs();
}
bootstrap();
