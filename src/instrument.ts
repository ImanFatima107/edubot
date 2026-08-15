import * as Sentry from '@sentry/nestjs';
import 'dotenv/config';

// Initialize Sentry SDK for NestJS
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});
