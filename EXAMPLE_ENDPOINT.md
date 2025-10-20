# Example Endpoint: POST /orders/:id/submit

This document showcases the complete implementation of the critical order submission endpoint with:
- DTO validation
- OpenAPI decorators
- BullMQ job enqueueing
- PDF generation
- Email sending

## Complete Flow

### 1. DTO with Validation
**File**: `src/modules/orders/dto/create-order.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ description: 'Quantity', example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Item notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Factory ID' })
  @IsUUID()
  factoryId: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Order notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

### 2. Controller with OpenAPI Decorators
**File**: `src/modules/orders/orders.controller.ts`

```typescript
@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':id/submit')
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Submit an order',
    description: 'Submits an order, generates PDF, and sends email to factory via BullMQ job queue',
  })
  @ApiResponse({
    status: 200,
    description: 'Order submitted and queued for processing',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order submitted successfully' },
        orderId: { type: 'string', example: 'uuid' },
        orderNumber: { type: 'string', example: 'ORD-2024-00001' },
        emailJobId: { type: 'string', example: 'uuid' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Order already submitted or has no items'
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.submit(id, user.userId);
  }
}
```

### 3. Service with BullMQ Integration
**File**: `src/modules/orders/orders.service.ts`

```typescript
@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {}

  async submit(orderId: string, userId: string) {
    // 1. Validate order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { factory: true, items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'DRAFT') {
      throw new BadRequestException('Order has already been submitted');
    }

    if (order.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // 2. Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // 3. Create email job record
    const emailJob = await this.prisma.emailJob.create({
      data: {
        to: [order.factory.contactEmail],
        subject: \`New Order: \${order.orderNumber}\`,
        status: 'PENDING',
        orderId: order.id,
        factoryId: order.factoryId,
      },
    });

    // 4. Enqueue job with BullMQ
    await this.emailQueue.add(
      'send-order-email',
      {
        orderId: order.id,
        emailJobId: emailJob.id,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    // 5. Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'SUBMIT_ORDER',
        entityType: 'Order',
        entityId: order.id,
        userId,
        orderId: order.id,
        changes: {
          orderNumber: order.orderNumber,
          status: 'SUBMITTED',
        },
      },
    });

    return {
      message: 'Order submitted successfully',
      orderId: order.id,
      orderNumber: order.orderNumber,
      emailJobId: emailJob.id,
    };
  }
}
```

### 4. BullMQ Processor (PDF + Email)
**File**: `src/modules/jobs/processors/email.processor.ts`

```typescript
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
    this.logger.log(\`Processing job \${job.id}\`);

    switch (job.name) {
      case 'send-order-email':
        return this.handleSendOrderEmail(job);
    }
  }

  private async handleSendOrderEmail(job: Job) {
    const { orderId, emailJobId } = job.data;

    try {
      // Update job status
      await this.prisma.emailJob.update({
        where: { id: emailJobId },
        data: { status: 'PROCESSING' },
      });

      // Fetch order with all data
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          organization: true,
          factory: true,
          user: true,
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
      });

      // Generate PDF
      this.logger.log(\`Generating PDF for \${order.orderNumber}\`);
      const pdfPath = await this.pdfService.generateOrderPdf(order);

      // Send email
      this.logger.log(\`Sending email to \${order.factory.contactEmail}\`);
      await this.emailService.sendOrderEmail(
        order.factory.contactEmail,
        order.orderNumber,
        pdfPath,
        order,
      );

      // Update order
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          pdfUrl: pdfPath,
          status: 'EMAILED',
          emailedAt: new Date(),
        },
      });

      // Update email job
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
        },
      });

      return { success: true, orderId, pdfPath };
    } catch (error) {
      // Handle retry logic
      const emailJob = await this.prisma.emailJob.findUnique({
        where: { id: emailJobId },
      });

      const attempts = (emailJob?.attempts || 0) + 1;

      await this.prisma.emailJob.update({
        where: { id: emailJobId },
        data: {
          attempts,
          status: attempts >= 3 ? 'FAILED' : 'PENDING',
          error: error.message,
        },
      });

      throw error;
    }
  }
}
```

## How It Works

### Request Flow

1. **Client calls**: `POST /api/v1/orders/{id}/submit`
2. **Authentication**: JWT guard validates token
3. **Authorization**: RolesGuard checks user role
4. **Validation**: NestJS validates request params
5. **Service logic**:
   - Validates order exists and is in DRAFT state
   - Updates order status to SUBMITTED
   - Creates EmailJob record in database
   - Enqueues job to BullMQ (Redis)
   - Returns immediately to client
6. **Background processing** (BullMQ worker):
   - Picks up job from queue
   - Generates PDF using Puppeteer
   - Sends email via SMTP with PDF attachment
   - Updates order status to EMAILED
   - Logs audit trail

### Benefits

- **Non-blocking**: Client gets immediate response
- **Reliable**: Job queue with automatic retries
- **Auditable**: Complete audit log
- **Scalable**: Workers can scale independently
- **Observable**: Job status tracked in database

## Testing the Endpoint

### 1. Create an Order
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "factoryId": "factory-uuid",
    "priceListId": "pricelist-uuid",
    "items": [
      {
        "variantId": "variant-uuid",
        "quantity": 10,
        "notes": "Please package carefully"
      }
    ],
    "notes": "Rush order"
  }'
```

### 2. Submit the Order
```bash
curl -X POST http://localhost:3000/api/v1/orders/{order-id}/submit \
  -H "Authorization: Bearer TOKEN"
```

Response:
```json
{
  "message": "Order submitted successfully",
  "orderId": "uuid",
  "orderNumber": "ORD-2024-00001",
  "emailJobId": "uuid"
}
```

### 3. Check Order Status
```bash
curl http://localhost:3000/api/v1/orders/{order-id} \
  -H "Authorization: Bearer TOKEN"
```

### 4. Get PDF URL
```bash
curl http://localhost:3000/api/v1/orders/{order-id}/pdf \
  -H "Authorization: Bearer TOKEN"
```

## Swagger Documentation

All of this is automatically documented at `/docs` with:
- Interactive API testing
- Request/response schemas
- Authentication flows
- Example values
- Error responses

This endpoint demonstrates the full power of the Vendora platform!
