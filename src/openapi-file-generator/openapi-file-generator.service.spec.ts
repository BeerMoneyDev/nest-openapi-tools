import { Test, TestingModule } from '@nestjs/testing';
import { AwsExtensionsService } from '../aws-extensions/aws-extensions.service';
import { OpenApiFileGeneratorService } from './openapi-file-generator.service';

describe('OpenApiFileGeneratorService', () => {
  let service: OpenApiFileGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenApiFileGeneratorService, AwsExtensionsService],
    }).compile();

    service = module.get<OpenApiFileGeneratorService>(
      OpenApiFileGeneratorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
