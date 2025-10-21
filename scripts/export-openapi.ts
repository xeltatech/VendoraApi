import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { AppModule } from '../src/app.module';

async function exportOpenAPI() {
  console.log('🚀 Exporting OpenAPI specification...\n');

  // Create NestJS application (without starting the server)
  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable logs for clean output
  });

  // Configure Swagger
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

  // Create docs folder if it doesn't exist
  const outputDir = './docs';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Export JSON
  const jsonPath = `${outputDir}/openapi.json`;
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
  console.log(`✅ OpenAPI JSON exported: ${jsonPath}`);

  // Export YAML
  const yamlString = yaml.dump(document, { noRefs: true });
  const yamlPath = `${outputDir}/openapi.yaml`;
  fs.writeFileSync(yamlPath, yamlString);
  console.log(`✅ OpenAPI YAML exported: ${yamlPath}`);

  console.log('\n📦 Files generated successfully!');
  console.log('\n💡 You can use these files for:');
  console.log('   - Generate iOS clients (Swift)');
  console.log('   - Generate Android clients (Kotlin)');
  console.log('   - Documentation in tools like Postman or Insomnia');
  console.log('   - Contract validation with testing tools');

  await app.close();
  process.exit(0);
}

exportOpenAPI().catch((error) => {
  console.error('❌ Error exporting OpenAPI:', error);
  process.exit(1);
});
