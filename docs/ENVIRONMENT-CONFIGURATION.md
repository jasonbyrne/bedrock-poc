# Environment Variable Configuration

This document explains the environment variable structure for the Medicare Chatbot POC.

## 🔐 Security Model

### Server-Side Variables

- **No prefix required** (e.g., `BEDROCK_ACCESS_KEY_ID`)
- Only accessible in server-side code via `$env/static/private`
- Never exposed to the browser
- Used for sensitive data like API keys, secrets, database credentials

### Client-Side Variables

- **Must use `PUBLIC_` prefix** (e.g., `PUBLIC_APP_NAME`)
- Accessible in both server and client code via `$env/static/public`
- **Exposed to the browser** - never put secrets here!
- Used for non-sensitive configuration like app names, API base URLs

## 📋 Environment Variables

### AWS Bedrock Configuration (Server-Side)

```bash
# Primary AWS credentials for Bedrock
BEDROCK_ACCESS_KEY_ID=your_aws_access_key_id_here
BEDROCK_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Model behavior configuration
BEDROCK_DEFAULT_TEMPERATURE=0.1       # Response randomness (0.0-1.0)
BEDROCK_DEFAULT_MAX_TOKENS=1024       # Maximum response length
BEDROCK_MESSAGE_CONTEXT_WINDOW=6      # Previous messages to include

# Rate limiting and reliability
BEDROCK_MAX_REQUESTS_PER_MINUTE=60    # Rate limit for API calls
BEDROCK_TIMEOUT_MS=30000              # Request timeout in milliseconds
BEDROCK_MAX_RETRY_ATTEMPTS=3          # Retry attempts for failed requests

# Development/testing
BEDROCK_MOCK_RESPONSES=false          # Use mock responses instead of real API
```

### AWS Medical Comprehend Configuration (Server-Side)

```bash
# Optional: Dedicated Medical Comprehend credentials
# If not provided, will fall back to Bedrock credentials
COMPREHEND_REGION=us-east-1
COMPREHEND_ACCESS_KEY_ID=              # Optional
COMPREHEND_SECRET_ACCESS_KEY=          # Optional
```

### Session & Cache Configuration (Server-Side)

```bash
CACHE_SESSION_SECRET=your_super_secret_session_key_here
CACHE_TTL_SECONDS=3600                 # Session cache TTL (1 hour)
CACHE_MAX_CONVERSATION_LENGTH=50       # Maximum messages per conversation
```

### Application Settings (Server-Side)

```bash
NODE_ENV=development
LOG_LEVEL=debug                        # Logging level (debug, info, warn, error)
ENABLE_REQUEST_LOGGING=true            # Log all HTTP requests
```

### Client-Side Configuration (PUBLIC\_ prefix)

```bash
# These variables are exposed to the browser - no secrets!
PUBLIC_APP_NAME="AI Drug Search POC"
PUBLIC_APP_VERSION="1.0.0"
PUBLIC_API_BASE_URL=http://localhost:5173/api
PUBLIC_MAX_MESSAGE_LENGTH=500
PUBLIC_TYPING_DELAY_MS=1000
PUBLIC_DEBUG_MODE=false
```

## 🏗️ Configuration Structure

Environment variables are centralized in two files:

- **Server-side**: `src/lib/server/config/env.server.ts` (uses `$env/static/private`)
- **Client-side**: `src/lib/config/env.ts` (uses `$env/static/public`)

Both follow SvelteKit's secure environment variable system for type safety and build-time validation.

## 🚀 Getting Started

1. Copy `env.example` to `.env`:

   ```bash
   cp env.example .env
   ```

2. Fill in your AWS credentials and other configuration values

3. Ensure `.env` is in your `.gitignore` (it should be by default)

4. For production deployment, set these environment variables in your hosting platform

## ⚠️ Security Best Practices

- **Never commit `.env` files** to version control
- **Use dedicated IAM users** with minimal required permissions for AWS services
- **Rotate credentials regularly**
- **Use different credentials** for development/staging/production environments
- **Monitor AWS CloudTrail** for unexpected API usage
- **Set up billing alerts** to catch unexpected usage

## 🔍 Troubleshooting

### Common Issues

1. **"AWS credentials not configured"**

   - Check that `BEDROCK_ACCESS_KEY_ID` and `BEDROCK_SECRET_ACCESS_KEY` are set
   - Verify credentials have necessary permissions

2. **"Cannot find name 'PUBLIC_SOMETHING'"**

   - Client-side variables must use `PUBLIC_` prefix
   - Check that you're importing from `$env/static/public` for client-side code

3. **"Environment variable not found"**
   - Ensure `.env` file exists and variables are set
   - Check for typos in variable names
   - Restart dev server after changing `.env` file
