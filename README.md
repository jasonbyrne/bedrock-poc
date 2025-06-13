# Medicare Chatbot POC

A proof-of-concept application demonstrating intent recognition and slot filling capabilities for a Medicare chatbot using AWS Bedrock (Claude 3 Haiku) and AWS Comprehend Medical.

> **Note**: This is a standalone POC that will be migrated into the main Medicare codebase once the initial phase is complete. The goal is to validate the approach and patterns before integration.

## �� Project Overview

This POC focuses on:

- Intent recognition and slot filling using AWS Bedrock
- Medical entity extraction with AWS Comprehend Medical
- Conversation management with in-memory storage
- Mock data integration for drug pricing and beneficiary information
- Strict adherence to provided data (zero hallucination tolerance)

### Key Features

- Natural-feeling conversational handling of incomplete information
- Proactive redirection for out-of-scope queries
- Factual accuracy and prevention of hallucinations
- Appropriate language use for Medicare context

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- AWS CLI configured with appropriate credentials
- Access to AWS Bedrock and AWS Comprehend Medical

### Environment Setup

- Copy `env.example` to `.env`:

```bash
cp env.example .env
```

- Configure your environment variables:
  - `BEDROCK_REGION`: AWS region for Bedrock
  - `BEDROCK_MODEL_ID`: Claude 3 Haiku model ID
  - `PUBLIC_APP_NAME`: Application name
  - Add other required variables from `.env.example`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Project Structure

```text
src/
├── lib/
│   ├── components/     # Svelte components (PascalCase)
│   │   ├── chat/      # Chat-specific components
│   │   ├── common/    # Shared UI components
│   │   └── layout/    # Layout components
│   ├── config/        # Application configuration
│   ├── data/          # Mock data and personas
│   ├── server/        # Backend logic
│   │   ├── controllers/  # Intent controllers
│   │   ├── services/    # External service integrations
│   │   ├── intents/     # Intent definitions and prompts
│   │   ├── core/       # Core functionality
│   │   └── prompts/    # System and intent prompts
│   ├── services/      # Client-side services
│   ├── stores/        # Svelte stores
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── routes/            # SvelteKit routes
│   ├── api/          # API endpoints
│   └── +page.svelte  # Main application page
├── static/           # Static assets
└── app.html         # Main HTML template

docs/                # Project documentation
├── CODE-CONVENTIONS.md
├── PROJECT-PLAN.md
└── ENVIRONMENT-VARIABLES.md
```

## 💻 Development

### Code Conventions

- Follow Svelte 5 syntax (see `docs/CODE-CONVENTIONS.md`)
- Use TypeScript with strict typing
- Follow naming conventions in documentation
- No use of `any` type - use proper types or `unknown`

### Key Files

- `src/lib/server/controllers/`: Intent-specific controllers
- `src/lib/server/services/`: External service integrations
- `src/lib/types/`: TypeScript interfaces and types
- `src/routes/api/`: API endpoints

### Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🔄 Development Workflow

1. **Environment Setup**

   - Ensure AWS credentials are configured
   - Set up environment variables
   - Install dependencies

2. **Local Development**

   - Run `npm run dev` for local development
   - Access the application at `http://localhost:5173`
   - Use the chat interface to test intents

3. **Adding New Intents**

   - Create a new intent file in `src/lib/server/intents/`
   - Export the intent in `src/lib/server/intents/index.ts` (barrel file)
   - Create a new controller in `src/lib/server/controllers/`
   - Add the controller to the router in `src/lib/server/router.ts`
   - Add tests for the new intent

4. **Testing**
   - Write unit tests for new functionality
   - Test intent recognition and slot filling
   - Verify conversation flow
   - Check error handling

## 📚 Documentation

- `docs/PROJECT-PLAN.md`: Project goals and architecture
- `docs/CODE-CONVENTIONS.md`: Coding standards and conventions
- `docs/ENVIRONMENT-VARIABLES.md`: Environment variable documentation

## 🔜 Next Steps

See `docs/PROJECT-PLAN.md` for upcoming features and improvements, including:

- MCT and BEDAP API integration
- Session storage with ElastiCache
- Query caching
- Kinesis Data Streams for logging
- Feature flagging system
- AWS Secrets Manager integration

## 🤝 Contributing

1. Follow the code conventions in `docs/CODE-CONVENTIONS.md`
2. Write tests for new functionality
3. Update documentation as needed
4. Use TypeScript and proper typing
5. Follow Svelte 5 syntax guidelines

## 📝 License

This project is for internal POC purposes only.
