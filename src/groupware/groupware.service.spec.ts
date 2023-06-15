import { Test, TestingModule } from '@nestjs/testing';
import { GroupwareService } from './groupware.service';

describe('GroupwareService', () => {
  let service: GroupwareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupwareService],
    }).compile();

    service = module.get<GroupwareService>(GroupwareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
