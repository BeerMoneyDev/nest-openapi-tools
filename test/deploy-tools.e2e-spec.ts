import { NestFactory } from '@nestjs/core';
import { DeployToolsModule } from '../src/deploy-tools/deploy-tools.module';

describe('DeployToolsModule (e2e)', () => {
  it('/ (GET)', async () => {
    try {
      const app = await NestFactory.createApplicationContext(DeployToolsModule, {
        logger: false,
      });
    } catch (ex) {
      console.error(ex);
    }
  });
});
