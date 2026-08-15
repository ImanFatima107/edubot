import { Test, TestingModule } from '@nestjs/testing';
import { EdubotController } from './edubot.controller';

describe('EdubotController', () => {
  let controller: EdubotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdubotController],
    }).compile();

    controller = module.get<EdubotController>(EdubotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
