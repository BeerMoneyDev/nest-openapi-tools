import { Injectable } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class OpenApiFileGeneratorService {
  async generateOpenApiFile(filePath: string, openApiDoc: OpenAPIObject) {
    if (!filePath?.length) {
      throw new Error('filePath is not defined.');
    }

    const swaggerDoc = JSON.parse(JSON.stringify(openApiDoc));
    if (!swaggerDoc?.components || !swaggerDoc?.components?.schemas) {
      delete swaggerDoc.components;
    }

    const fullPath = join(process.cwd(), filePath);
    if (fullPath.toLocaleLowerCase().endsWith('.yaml')) {
      const yaml = await import('yaml');
      const swaggerYaml = yaml
        .stringify(swaggerDoc)
        .replace(`Version: 2012-10-17`, `Version: '2012-10-17'`);
      writeFileSync(fullPath, swaggerYaml);
    } else {
      const swaggerJson = JSON.stringify(swaggerDoc);
      writeFileSync(fullPath, swaggerJson);
    }
  }
}
