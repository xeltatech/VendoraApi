import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Vendora Platform');
      const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL');

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully: ${info.messageId}`);
      this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw error;
    }
  }

  async sendOrderEmail(
    factoryEmail: string,
    orderNumber: string,
    pdfPath: string,
    orderData: any,
  ): Promise<void> {
    const subject = `New Order: ${orderNumber} from ${orderData.organization.name}`;

    const html = `
      <h2>New Order Received</h2>
      <p>Dear ${orderData.factory.name},</p>
      <p>You have received a new order from <strong>${orderData.organization.name}</strong>.</p>

      <h3>Order Details:</h3>
      <ul>
        <li><strong>Order Number:</strong> ${orderNumber}</li>
        <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Total Amount:</strong> ${orderData.currency} ${orderData.totalAmount}</li>
        <li><strong>Items:</strong> ${orderData.items.length}</li>
      </ul>

      ${orderData.notes ? `<p><strong>Notes:</strong> ${orderData.notes}</p>` : ''}

      <p>Please find the detailed order attached as a PDF.</p>

      <p>Best regards,<br>Vendora Platform</p>
    `;

    await this.sendEmail({
      to: factoryEmail,
      subject,
      html,
      attachments: [
        {
          filename: `order-${orderNumber}.pdf`,
          path: pdfPath,
        },
      ],
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection failed', error);
      return false;
    }
  }
}
