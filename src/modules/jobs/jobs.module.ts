import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './processors/email.processor';
import { PdfModule } from '@/services/pdf/pdf.module';
import { EmailModule } from '@/services/email/email.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    PdfModule,
    EmailModule,
  ],
  providers: [EmailProcessor],
  exports: [BullModule],
})
export class JobsModule {}
