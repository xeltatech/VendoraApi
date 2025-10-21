# Keeping Your Postman Collection Up-to-Date

This guide explains how to keep your Postman collection in sync with your API code changes.

## 🔄 Auto-Generation Workflow

Your API uses **OpenAPI/Swagger** to automatically document all endpoints. Every time you start your application, it generates fresh OpenAPI specs that can be converted to Postman collections.

## 📋 Quick Update Process

### Method 1: Generate from Running API

When your API is running, it auto-generates the OpenAPI spec:

```bash
# 1. Start your API (this auto-generates docs/openapi.json)
yarn start:dev

# 2. In a new terminal, generate the Postman collection
yarn postman:generate
```
