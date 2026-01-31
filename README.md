# Zuplo API Gateway

Simple API gateway using Zuplo for testing JWT token validation with WorkOS authentication.

## Overview

This gateway provides:
- **JWT Token Validation**: Validates WorkOS JWT tokens using JWKS
- **Protected Routes**: Endpoints that require authentication
- **Public Routes**: Endpoints accessible without authentication
- **User Information Extraction**: Access user data from validated JWT tokens

## Project Structure

```
zuplo/
├── zuplo.jsonc              # Main Zuplo configuration
├── config/
│   ├── routes.json          # API route definitions
│   └── policies.json        # Security policies (JWT validation, CORS)
└── modules/
    ├── user-handler.ts      # Returns user info from JWT
    ├── protected-handler.ts # Protected resource handler
    └── public-handler.ts    # Public resource handler
```

## Setup

### 1. Create a Zuplo Account

1. Go to [zuplo.com](https://zuplo.com) and sign up
2. Create a new project or import this configuration

### 2. Deploy to Zuplo

**Option A: Using Zuplo CLI**
```bash
# Install Zuplo CLI
npm install -g zuplo

# Navigate to the zuplo directory
cd zuplo

# Deploy
zuplo deploy
```

**Option B: Using Zuplo Dashboard**
1. Log in to [portal.zuplo.com](https://portal.zuplo.com)
2. Create a new project
3. Upload or copy the configuration files from the `zuplo/` directory
4. Deploy the project

### 3. Configure Environment Variables

In your Zuplo project settings, add:

- `WORKOS_CLIENT_ID`: Your WorkOS Client ID (from WorkOS Dashboard)
- `WORKOS_API_URL`: `https://api.workos.com` (optional)

You can find your WorkOS Client ID in the WorkOS Dashboard under API Keys.

## API Endpoints

### Public Endpoints

#### Health Check
```bash
GET /health
```

Returns a simple health check response. No authentication required.

```bash
curl https://your-gateway.zuplo.app/health
```

#### Public Resource
```bash
GET /api/v1/public
```

Public endpoint accessible without authentication.

```bash
curl https://your-gateway.zuplo.app/api/v1/public
```

### Protected Endpoints (Require JWT Token)

#### Get Current User
```bash
GET /api/v1/me
Authorization: Bearer <JWT_TOKEN>
```

Returns user information extracted from the JWT token.

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-gateway.zuplo.app/api/v1/me
```

#### Protected Resource
```bash
GET /api/v1/protected
Authorization: Bearer <JWT_TOKEN>
```

Protected endpoint that validates JWT and returns data.

```bash
# GET request
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-gateway.zuplo.app/api/v1/protected

# POST request
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}' \
  https://your-gateway.zuplo.app/api/v1/protected
```

## Testing JWT Validation

### 1. Get a JWT Token from Your Next.js App

After logging in to your Next.js application, you can obtain the JWT token:

**From the browser (DevTools Console):**
```javascript
// This requires access to the session cookie
document.cookie.split('; ').find(row => row.startsWith('wos-session'));
```

**From your Next.js API route:**
```typescript
import { getAccessToken } from "@workos-inc/authkit-nextjs";

export async function GET() {
  const accessToken = await getAccessToken();
  return Response.json({ token: accessToken });
}
```

### 2. Test the Token

**Valid Token (200 OK):**
```bash
curl -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  https://your-gateway.zuplo.app/api/v1/me
```

**Invalid Token (401 Unauthorized):**
```bash
curl -H "Authorization: Bearer invalid_token" \
  https://your-gateway.zuplo.app/api/v1/me
```

**No Token (401 Unauthorized):**
```bash
curl https://your-gateway.zuplo.app/api/v1/me
```

## JWT Validation Details

The JWT validation policy (`jwt-auth-policy`) in [config/policies.json](config/policies.json) validates:

1. **Signature**: Verifies the token is signed by WorkOS using JWKS
2. **Issuer**: Checks `iss` claim matches `https://api.workos.com/sso`
3. **Audience**: Validates `aud` claim matches your `WORKOS_CLIENT_ID`
4. **Expiration**: Ensures token hasn't expired (`exp` claim)
5. **Format**: Validates JWT structure and format

## Integration with Your Next.js App

Update your API client to use the Zuplo gateway:

```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_ZUPLO_URL || "https://your-gateway.zuplo.app";

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const accessToken = await getAccessToken(); // Get from WorkOS
  
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      ...options.headers,
    },
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  // ... rest of the implementation
}
```

## Environment Variables

Add to your `.env.local`:

```bash
# Zuplo Gateway URL (after deployment)
NEXT_PUBLIC_ZUPLO_URL=https://your-gateway.zuplo.app
```

## Customization

### Adding New Routes

Edit [config/routes.json](config/routes.json):

```json
{
  "path": "/api/v1/your-route",
  "methods": ["GET"],
  "policies": {
    "inbound": ["jwt-auth-policy"]  // Add for protected routes
  },
  "handler": {
    "module": "$import(./modules/your-handler)",
    "export": "default"
  }
}
```

### Custom JWT Validation

Modify the `jwt-auth-policy` in [config/policies.json](config/policies.json) to adjust:
- JWKS URL
- Audience validation
- Issuer validation
- Additional claims validation

### Adding Request/Response Logging

Create a logging policy and add it to routes:

```typescript
// modules/logging-policy.ts
export default async function (request: ZuploRequest, context: ZuploContext) {
  context.log.info("Request received", {
    method: request.method,
    path: request.url,
    headers: Object.fromEntries(request.headers),
  });
  return request;
}
```

## Troubleshooting

### Token Validation Fails

1. Verify `WORKOS_CLIENT_ID` is set correctly in Zuplo environment variables
2. Check the token hasn't expired
3. Ensure the token is from the correct WorkOS application
4. Verify JWKS URL is accessible: `https://api.workos.com/sso/jwks/YOUR_CLIENT_ID`

### CORS Issues

Update the CORS policy in [config/policies.json](config/policies.json):

```json
{
  "name": "your-cors-policy",
  "allowOrigins": ["https://your-nextjs-app.com"],
  "allowMethods": ["GET", "POST"],
  "allowCredentials": true
}
```

## Resources

- [Zuplo Documentation](https://zuplo.com/docs)
- [Zuplo JWT Authentication](https://zuplo.com/docs/policies/jwt-auth-inbound)
- [WorkOS Documentation](https://workos.com/docs)
- [JWT.io Debugger](https://jwt.io) - Decode and inspect JWTs

## Next Steps

1. Deploy to Zuplo
2. Get the gateway URL
3. Update `NEXT_PUBLIC_ZUPLO_URL` in your Next.js app
4. Test token validation with authenticated requests
5. Add custom business logic to handlers
6. Implement rate limiting, caching, or other policies
