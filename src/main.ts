import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '*').split(',');

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('Vendora API')
    .setDescription('B2B Digital Catalog Platform - API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('organizations', 'Organization management')
    .addTag('factories', 'Factory management')
    .addTag('products', 'Product catalog')
    .addTag('price-lists', 'Price list management')
    .addTag('orders', 'Order management')
    .addTag('search', 'Product search')
    .addTag('health', 'System health checks')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Generate OpenAPI files (JSON and YAML)
  const outputDir = './docs';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save OpenAPI as JSON
  fs.writeFileSync(
    `${outputDir}/openapi.json`,
    JSON.stringify(document, null, 2),
  );
  logger.log(`OpenAPI JSON generated: ${outputDir}/openapi.json`);

  // Save OpenAPI as YAML
  const yamlString = yaml.dump(document, { noRefs: true });
  fs.writeFileSync(`${outputDir}/openapi.yaml`, yamlString);
  logger.log(`OpenAPI YAML generated: ${outputDir}/openapi.yaml`);

  // Only expose Swagger UI in development
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  if (nodeEnv !== 'production') {
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    logger.log(`Swagger UI available at: http://localhost:${port}/docs`);
  } else {
    logger.log('Swagger UI disabled in production mode');
  }

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/docs`);
  logger.log(`API Prefix: /${apiPrefix}`);
}

bootstrap();
