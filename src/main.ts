import './instrument';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register Sentry global exception filter to catch all unhandled server exceptions
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryGlobalFilter(httpAdapter));

  // Setup Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('EduBot API')
    .setDescription('The EduBot AI roadmap generation and emailer service API description')
    .setVersion('1.0')
    .addTag('edubot')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();

