import { Test, TestingModule } from '@nestjs/testing';
import { OpenApiAngularClientGeneratorService } from './openapi-angular-client-generator.service';

describe('OpenApiAngularClientGeneratorService', () => {
  let service: OpenApiAngularClientGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenApiAngularClientGeneratorService],
    }).compile();

    service = module.get<OpenApiAngularClientGeneratorService>(OpenApiAngularClientGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
