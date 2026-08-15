import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdubotModule } from './edubot/edubot.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    EdubotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

