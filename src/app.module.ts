import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './services/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { FactoriesModule } from './modules/factories/factories.module';
import { ProductsModule } from './modules/products/products.module';
import { PriceListsModule } from './modules/price-lists/price-lists.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SearchModule } from './modules/search/search.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MeilisearchModule } from './services/meilisearch/meilisearch.module';
import { PdfModule } from './services/pdf/pdf.module';
import { EmailModule } from './services/email/email.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // BullMQ for job queues
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Core services
    PrismaModule,
    MeilisearchModule,
    PdfModule,
    EmailModule,

    // Business modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    FactoriesModule,
    ProductsModule,
    PriceListsModule,
    OrdersModule,
    SearchModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
