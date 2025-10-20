# Vendora API - Setup & Getting Started

## Initial Setup

### 1. Install Dependencies
```bash
yarn install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
- Database credentials
- Redis connection
- Meilisearch key
- JWT secrets
- SMTP credentials (for Resend or other provider)

### 3. Start Infrastructure Services

Using Docker Compose:
```bash
docker-compose up -d postgres redis meilisearch
```

Or install locally:
- PostgreSQL 16
- Redis 7
- Meilisearch 1.5

### 4. Initialize Database

Generate Prisma client:
```bash
yarn prisma:generate
```

Run migrations:
```bash
yarn prisma:migrate
```

Open Prisma Studio to view data:
```bash
yarn prisma:studio
```

### 5. Start the API

Development mode:
```bash
yarn start:dev
```

The API will be available at:
- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/docs

## Testing the API

### 1. Create an Admin User

Since there's no seed data, you'll need to create the first user directly in the database or via Prisma Studio.

Using Prisma Studio:
1. Run `yarn prisma:studio`
2. Create an Organization
3. Create a User with role `ADMIN`
4. Set password hash (use bcrypt with 10 rounds)

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vendora.com",
    "password": "yourpassword"
  }'
```

Save the `accessToken` from the response.

### 3. Create a Factory

```bash
curl -X POST http://localhost:3000/api/v1/factories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Textiles",
    "code": "FAC-TEXT-001",
    "contactEmail": "orders@abctextiles.com",
    "contactPhone": "+1-555-0100",
    "address": "123 Factory Street"
  }'
```

### 4. Create a Product

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001",
    "name": "Premium Cotton T-Shirt",
    "description": "High-quality cotton t-shirt",
    "category": "Apparel",
    "tags": ["cotton", "t-shirt"],
    "factoryId": "FACTORY_ID_FROM_STEP_3"
  }'
```

### 5. Test Order Flow

See the Swagger docs at `/docs` for complete order creation and submission flow.

## Key Endpoints to Test

1. **POST /auth/login** - Get access token
2. **GET /products** - List products
3. **POST /orders** - Create draft order
4. **POST /orders/:id/submit** - Submit order (triggers PDF + email)
5. **GET /orders/:id** - View order details
6. **GET /search/products?q=cotton** - Search products

## Production Deployment

### Docker Compose (Recommended)

1. **Set production environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build and start**:
   ```bash
   docker-compose up -d
   ```

3. **Run migrations**:
   ```bash
   docker-compose exec api yarn prisma:migrate:prod
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f api
   ```

### With Caddy (TLS/SSL)

1. **Update Caddyfile** with your domain:
   ```
   docker/Caddyfile
   ```

2. **Start with Caddy**:
   ```bash
   docker-compose --profile production up -d
   ```

Caddy will automatically provision SSL certificates via Let's Encrypt.

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Metrics
```bash
curl http://localhost:3000/metrics
```

### BullMQ Dashboard (Optional)

Install Bull Board for job monitoring:
```bash
yarn add @bull-board/api @bull-board/nestjs
```

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify network connectivity

### Redis Connection Issues
- Check `REDIS_HOST` and `REDIS_PORT`
- Ensure Redis is running

### Meilisearch Issues
- Check `MEILI_HOST` and `MEILI_MASTER_KEY`
- Verify Meilisearch is accessible

### PDF Generation Issues
- Ensure Puppeteer/Chromium is installed
- Check storage path permissions
- Verify `PDF_STORAGE_PATH` exists

### Email Issues
- Verify SMTP credentials
- Check SMTP host and port
- Test with a simple email first

## Next Steps

1. Create a seed script for sample data
2. Set up proper logging (Winston, Pino)
3. Add unit and e2e tests
4. Configure CI/CD pipeline
5. Set up monitoring (Sentry, DataDog, etc.)
6. Implement rate limiting per user
7. Add file upload for product images
8. Create admin dashboard (Next.js)
9. Build mobile app (React Native)

## Support

For issues, check:
- Swagger docs at `/docs`
- Application logs
- Docker logs: `docker-compose logs -f`
