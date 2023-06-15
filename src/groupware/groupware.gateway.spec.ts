import { Test, TestingModule } from '@nestjs/testing';
import { GroupwareGateway } from './groupware.gateway';
import { GroupwareService } from './groupware.service';

describe('GroupwareGateway', () => {
  let gateway: GroupwareGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupwareGateway, GroupwareService],
    }).compile();

    gateway = module.get<GroupwareGateway>(GroupwareGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
