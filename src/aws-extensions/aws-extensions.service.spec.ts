import { Test, TestingModule } from '@nestjs/testing';
import { AwsExtensionsService } from './aws-extensions.service';

describe('AwsExtensionsService', () => {
  let service: AwsExtensionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsExtensionsService],
    }).compile();

    service = module.get<AwsExtensionsService>(AwsExtensionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
