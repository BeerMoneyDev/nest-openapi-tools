import { Injectable } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';
import { stringify as yamlStringify } from 'yaml';
import { writeFileSync } from 'fs';

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

    if (filePath.toLocaleLowerCase().endsWith('.yaml')) {
      const swaggerYaml = yamlStringify(swaggerDoc).replace(
        `Version: 2012-10-17`,
        `Version: '2012-10-17'`,
      );
      writeFileSync(filePath, swaggerYaml);
    } else {
      const swaggerJson = JSON.stringify(swaggerDoc);
      writeFileSync(filePath, swaggerJson);
    }
  }
}
