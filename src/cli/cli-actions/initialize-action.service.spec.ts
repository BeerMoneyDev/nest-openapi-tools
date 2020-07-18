import { Test, TestingModule } from '@nestjs/testing';
import { InitializeActionService } from './initialize-action.service';

describe('InitializeActionService', () => {
  let service: InitializeActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitializeActionService],
    }).compile();

    service = module.get<InitializeActionService>(InitializeActionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
