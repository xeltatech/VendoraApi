# 📖 Vendora API - OpenAPI Specification

This folder contains the OpenAPI specification files for the Vendora API.

## 📁 Available Files

- **`openapi.json`** - Specification in JSON format
- **`openapi.yaml`** - Specification in YAML format

## 🔄 Automatic Generation

These files are generated **automatically** every time you:

1. Start the development server: `yarn start:dev`
2. Start the production server: `yarn start:prod`
3. Run the manual command: `yarn openapi:export`

## 📱 Usage for Mobile Clients

### iOS (Swift)

```bash
# Install OpenAPI Generator
brew install openapi-generator

# Generate Swift client
openapi-generator generate \
  -i docs/openapi.json \
  -g swift5 \
  -o ./ios-client \
  --additional-properties=projectName=VendoraAPI
```

### Android (Kotlin)

```bash
# Generate Kotlin client
openapi-generator generate \
  -i docs/openapi.json \
  -g kotlin \
  -o ./android-client \
  --additional-properties=packageName=com.vendora.api
```

### Flutter (Dart)

```bash
# Generate Dart client
openapi-generator generate \
  -i docs/openapi.json \
  -g dart \
  -o ./flutter-client
```

## 🛠️ Compatible Tools

- **Postman**: Import `openapi.json` to test the API
- **Insomnia**: Import `openapi.yaml` for interactive documentation
- **Swagger Editor**: Edit and visualize the specification
- **Redoc**: Generate beautiful HTML documentation
- **OpenAPI Generator**: Generate clients in 50+ languages

## 🔐 Security in Production

In production (`NODE_ENV=production`):
- ✅ These files are automatically generated
- ❌ Swagger UI (`/docs`) is **disabled**
- ❌ Endpoints `/docs-json` and `/docs-yaml` are **NOT exposed**

This means the OpenAPI specification is only available in these static files, not via public URLs.

## 📚 Additional Documentation

For more information about the API:

- **Local Development**: http://localhost:3000/docs (development only)
- **Health Check**: http://localhost:3000/api/v1/health
- **API Base URL**: http://localhost:3000/api/v1

## 🚀 Useful Commands

```bash
# Generate OpenAPI manually without starting the server
yarn openapi:export

# View the OpenAPI specification in readable format
cat docs/openapi.yaml
```

## 📝 Version Control

These files **should be committed** to the repository so that:
- Mobile client developers have access to the specification
- API change history is maintained
- Breaking changes can be detected with diff tools

If you prefer **NOT** to commit these files, uncomment the corresponding lines in `.gitignore`.
