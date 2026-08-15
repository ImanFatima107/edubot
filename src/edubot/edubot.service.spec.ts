import { Test, TestingModule } from '@nestjs/testing';
import { EdubotService } from './edubot.service';

describe('EdubotService', () => {
  let service: EdubotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EdubotService],
    }).compile();

    service = module.get<EdubotService>(EdubotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
