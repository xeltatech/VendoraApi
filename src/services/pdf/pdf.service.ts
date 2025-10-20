import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as Handlebars from 'handlebars';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly storagePath: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.storagePath = this.configService.get<string>('PDF_STORAGE_PATH', '/tmp/vendora-pdfs');
    this.baseUrl = this.configService.get<string>('PDF_BASE_URL', 'http://localhost:3000');

    // Ensure storage directory exists
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async generateOrderPdf(orderData: any): Promise<string> {
    this.logger.log(`Generating PDF for order: ${orderData.orderNumber}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Load the HTML template
      const html = await this.generateOrderHtml(orderData);

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const filename = `order-${orderData.orderNumber}-${uuidv4()}.pdf`;
      const filepath = path.join(this.storagePath, filename);

      await page.pdf({
        path: filepath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      this.logger.log(`PDF generated successfully: ${filename}`);

      // Return the public URL or file path
      return filepath;
    } catch (error) {
      this.logger.error('Error generating PDF', error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async generateOrderHtml(orderData: any): Promise<string> {
    const templatePath = path.join(process.cwd(), 'templates', 'order-pdf.hbs');

    let template: HandlebarsTemplateDelegate;

    // Check if template exists, otherwise use default template
    if (fs.existsSync(templatePath)) {
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      template = Handlebars.compile(templateSource);
    } else {
      template = Handlebars.compile(this.getDefaultTemplate());
    }

    return template({
      ...orderData,
      generatedAt: new Date().toISOString(),
    });
  }

  private getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order {{orderNumber}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
    .container { padding: 20px; }
    .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { font-size: 24px; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-block h3 { font-size: 14px; margin-bottom: 10px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .totals { text-align: right; margin-top: 20px; }
    .totals table { margin-left: auto; width: 300px; }
    .totals th, .totals td { border: none; }
    .total-amount { font-size: 16px; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ORDER {{orderNumber}}</h1>
      <p>Date: {{submittedAt}}</p>
    </div>

    <div class="info-grid">
      <div class="info-block">
        <h3>FROM</h3>
        <p><strong>{{organization.name}}</strong></p>
        <p>{{organization.address}}</p>
        <p>{{organization.email}}</p>
        <p>{{organization.phone}}</p>
      </div>
      <div class="info-block">
        <h3>TO</h3>
        <p><strong>{{factory.name}}</strong></p>
        <p>{{factory.address}}</p>
        <p>{{factory.contactEmail}}</p>
        <p>{{factory.contactPhone}}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Product</th>
          <th>Variant</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{variant.sku}}</td>
          <td>{{variant.product.name}}</td>
          <td>{{variant.name}}</td>
          <td>{{quantity}}</td>
          <td>{{currency}} {{unitPrice}}</td>
          <td>{{currency}} {{totalPrice}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr class="total-amount">
          <th>TOTAL AMOUNT</th>
          <td>{{currency}} {{totalAmount}}</td>
        </tr>
      </table>
    </div>

    {{#if notes}}
    <div style="margin-top: 30px;">
      <h3>Notes:</h3>
      <p>{{notes}}</p>
    </div>
    {{/if}}

    <div class="footer">
      <p>Generated by Vendora Platform on {{generatedAt}}</p>
      <p>Submitted by: {{user.firstName}} {{user.lastName}} ({{user.email}})</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  async deletePdf(filepath: string): Promise<void> {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      this.logger.log(`PDF deleted: ${filepath}`);
    }
  }

  getPdfUrl(filepath: string): string {
    const filename = path.basename(filepath);
    return `${this.baseUrl}/pdfs/${filename}`;
  }
}
