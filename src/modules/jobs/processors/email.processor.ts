import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@/services/prisma/prisma.service';
import { EmailService } from '@/services/email/email.service';
import { PdfService } from '@/services/pdf/pdf.service';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private pdfService: PdfService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'send-order-email':
        return this.handleSendOrderEmail(job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleSendOrderEmail(job: Job) {
    const { orderId, emailJobId } = job.data;

    try {
      this.logger.log(`Sending order email for order ${orderId}`);

      // Update email job status to PROCESSING
      await this.prisma.emailJob.update({
        where: { id: emailJobId },
        data: { status: 'PROCESSING' },
      });

      // Fetch order with all related data
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          organization: true,
          factory: true,
          user: true,
          priceList: true,
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Generate PDF
      this.logger.log(`Generating PDF for order ${order.orderNumber}`);
      const pdfPath = await this.pdfService.generateOrderPdf(order);

      // Send email with PDF attachment
      this.logger.log(`Sending email to ${order.factory.contactEmail}`);
      await this.emailService.sendOrderEmail(
        order.factory.contactEmail,
        order.orderNumber,
        pdfPath,
        order,
      );

      // Update order with PDF URL and emailed timestamp
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          pdfUrl: pdfPath,
          status: 'EMAILED',
          emailedAt: new Date(),
        },
      });

      // Update email job status to SENT
      await this.prisma.emailJob.update({
        where: { id: emailJobId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          action: 'EMAIL_SENT',
          entityType: 'Order',
          entityId: orderId,
          userId: order.userId,
          orderId: orderId,
          changes: {
            orderNumber: order.orderNumber,
            factory: order.factory.name,
            sentTo: order.factory.contactEmail,
          },
        },
      });

      this.logger.log(`Order email sent successfully for order ${order.orderNumber}`);

      return { success: true, orderId, pdfPath };
    } catch (error) {
      this.logger.error(`Error sending order email for order ${orderId}`, error);

      // Update email job with error
      const emailJob = await this.prisma.emailJob.findUnique({
        where: { id: emailJobId },
      });

      const attempts = (emailJob?.attempts || 0) + 1;
      const maxAttempts = emailJob?.maxAttempts || 3;

      await this.prisma.emailJob.update({
        where: { id: emailJobId },
        data: {
          attempts,
          status: attempts >= maxAttempts ? 'FAILED' : 'PENDING',
          error: error.message,
        },
      });

      throw error;
    }
  }
}
