# Vendora API

B2B Digital Catalog Platform Backend - Multi-factory wholesale ordering system for tablets with PDF generation and email integration.

## Features

- **Multi-tenancy**: Organizations, factories, and role-based access control
- **Product Catalog**: Products, variants, and flexible pricing
- **Order Management**: Draft orders with PDF generation and automated email delivery
- **Search**: Fast product search powered by Meilisearch
- **Job Queue**: BullMQ for async PDF/email processing
- **Authentication**: JWT with refresh token rotation
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Docker Ready**: Full Docker Compose setup for easy deployment

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL via Prisma ORM
- **Search**: Meilisearch
- **Queue**: BullMQ (Redis)
- **PDF**: Puppeteer
- **Email**: Nodemailer (SMTP)
- **Auth**: JWT + Passport
- **Docs**: Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn
- Docker & Docker Compose (for containerized setup)

### Local Development

1. **Install dependencies**:
   ```bash
   yarn
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure** (Postgres, Redis, Meilisearch):
   ```bash
   docker-compose up -d postgres redis meilisearch
   ```

4. **Run migrations**:
   ```bash
   yarn prisma:migrate
   ```

5. **Start development server**:
   ```bash
   yarn start:dev
   ```

6. **Access the API**:
   - API: http://localhost:3000/api/v1
   - Swagger Docs: http://localhost:3000/docs
   - Health Check: http://localhost:3000/api/v1/health

### Docker Deployment

**Start all services**:
```bash
docker-compose up -d
```

**View logs**:
```bash
docker-compose logs -f api
```

**Stop all services**:
```bash
docker-compose down
```

## Project Structure

```
vendora-api/
├── src/
│   ├── modules/           # Business modules
│   │   ├── auth/         # JWT authentication
│   │   ├── users/        # User management
│   │   ├── organizations/
│   │   ├── factories/
│   │   ├── products/     # Product catalog
│   │   ├── price-lists/  # Pricing management
│   │   ├── orders/       # Order processing
│   │   ├── search/       # Meilisearch integration
│   │   └── jobs/         # BullMQ processors
│   ├── services/         # Core services
│   │   ├── prisma/       # Database client
│   │   ├── meilisearch/  # Search client
│   │   ├── pdf/          # PDF generation
│   │   └── email/        # Email service
│   ├── common/           # Shared utilities
│   │   ├── filters/      # Exception filters
│   │   └── interceptors/ # Logging interceptor
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma     # Database schema
├── docker/
│   ├── Dockerfile
│   └── Caddyfile
├── docker-compose.yml
└── package.json
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Products
- `GET /products` - List products
- `POST /products` - Create product (Admin)
- `GET /products/:id` - Get product
- `PATCH /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Orders
- `POST /orders` - Create order (draft)
- `POST /orders/:id/submit` - Submit order (generates PDF & sends email)
- `GET /orders` - List orders
- `GET /orders/:id` - Get order
- `GET /orders/:id/pdf` - Get PDF URL

### Search
- `GET /search/products?q=...` - Search products with filters

### Admin Endpoints
- Users: `/users`
- Organizations: `/organizations`
- Factories: `/factories`
- Price Lists: `/price-lists`

### Health & Metrics
- `GET /health` - Health check
- `GET /metrics` - System metrics

## Database Schema

Key models:
- **organizations** - B2B clients
- **users** - Users with roles (admin, seller, factory_viewer)
- **factories** - Manufacturers
- **products** - Product catalog
- **product_variants** - Color/size/attributes
- **price_lists** - Pricing tiers
- **prices** - Variant pricing
- **orders** - Orders with items
- **order_items** - Line items
- **email_jobs** - Email queue tracking
- **audit_logs** - Audit trail

## Order Processing Flow

1. **Create Order**: Seller creates a draft order with items
2. **Submit Order**: `POST /orders/:id/submit`
   - Order status → SUBMITTED
   - Create email job
   - Enqueue BullMQ job
3. **BullMQ Processor**:
   - Generate PDF using Puppeteer
   - Send email to factory with PDF attachment
   - Update order status → EMAILED
   - Log audit trail
4. **Factory receives**: Email with PDF order

## Environment Variables

See `.env.example` for all configuration options.

Required variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `MEILI_MASTER_KEY` - Meilisearch API key
- `JWT_SECRET` - JWT secret
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` - Email config

## Development Commands

```bash
# Development
yarn start:dev          # Start with hot reload
yarn build             # Build for production
yarn start:prod        # Start production build

# Database
yarn prisma:generate   # Generate Prisma client
yarn prisma:migrate    # Run migrations
yarn prisma:studio     # Open Prisma Studio

# Docker
yarn docker:up         # Start all services
yarn docker:down       # Stop all services
yarn docker:logs       # View API logs

# Testing
yarn test              # Run tests
yarn test:watch        # Run tests in watch mode
yarn test:cov          # Run tests with coverage
```

## Deployment to Hetzner VPS

1. **Provision VPS** (~$10/month)
2. **Install Docker & Docker Compose**
3. **Clone repository**
4. **Set up environment**: Copy `.env.example` to `.env` and configure
5. **Run migrations**: `docker-compose run api yarn prisma:migrate:prod`
6. **Start services**: `docker-compose up -d`
7. **Configure domain** (optional):
   - Update `docker/Caddyfile` with your domain
   - Start Caddy: `docker-compose --profile production up -d`

## API Documentation

### Swagger UI (Development Only)

Swagger UI is available at `/docs` **only in development mode** (`NODE_ENV=development`).

In production, Swagger UI is disabled for security reasons.

### OpenAPI Specification

OpenAPI files are auto-generated at startup in the `docs/` folder:
- `docs/openapi.json` - JSON format
- `docs/openapi.yaml` - YAML format

**Manual export:**
```bash
yarn openapi:export
```

**Use cases:**
- Generate mobile clients (iOS/Swift, Android/Kotlin, Flutter/Dart)
- Import into Postman/Insomnia for API testing
- Generate documentation with Redoc
- Contract testing and validation

All endpoints include:
- OpenAPI decorators
- Request/response schemas
- Authentication requirements
- Example values

## Security Features

- JWT with refresh token rotation
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Global exception filter
- Request logging
- Rate limiting
- CORS configuration
- Helmet security headers

## License

UNLICENSED - Private use only

## Support

For issues and questions, contact the development team.
