import { Module } from '@nestjs/common';
import { EdubotController } from './edubot.controller';
import { EdubotService } from './edubot.service';

@Module({
  controllers: [EdubotController],
  providers: [EdubotService]
})
export class EdubotModule {}
