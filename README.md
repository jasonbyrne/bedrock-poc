# Medicare Chatbot POC - AWS Bedrock Integration

A **Proof of Concept** application demonstrating intent recognition and slot filling capabilities for a Medicare beneficiary chatbot using **AWS Bedrock (Claude 3 Haiku)** and **AWS Medical Comprehend**.

## 🚨 **Important: This project uses Svelte 5, not Svelte 4!**

## 📚 Documentation

**REQUIRED READING** - Please review these documents before contributing:

- **[📋 Project Plan](docs/PROJECT-PLAN.md)** - Complete project overview, goals, and architecture
- **[⚙️ Code Conventions](docs/CODE-CONVENTIONS.md)** - Svelte 5 patterns, TypeScript standards, and naming conventions
- **[🔧 Environment Setup](.env.example)** - Environment variable configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- AWS Account (for Bedrock/Comprehend access)

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd max-be-chatbot-bedrock-poc
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and configuration
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm run test
   ```

## 🏗️ Tech Stack

- **Frontend**: Svelte 5 + SvelteKit
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest + jsdom
- **Build Tool**: Vite
- **AI/ML**: AWS Bedrock (Claude 3 Haiku) + AWS Medical Comprehend
- **State Management**: Svelte 5 runes (`$state`, `$derived`, `$effect`)

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components (PascalCase)
│   ├── services/           # Business logic services (camelCase)
│   ├── types/              # TypeScript type definitions (camelCase)
│   ├── utils/              # Utility functions (camelCase)
│   └── server/             # Server-only code
├── routes/
│   ├── api/                # API endpoints (+server.ts files)
│   └── +page.svelte        # Application pages
docs/                       # Project documentation
```

## ✅ Current Implementation Status

### Completed Features

- ✅ **Project Setup**: SvelteKit with TypeScript and Vite configuration
- ✅ **Code Standards**: Comprehensive code conventions and documentation
- ✅ **Authentication System**: Mock JWT-based auth with 5 detailed Medicare personas
- ✅ **UI Components**: Modular Svelte 5 components with proper TypeScript interfaces
- ✅ **Modern Styling**: Beautiful Tailwind CSS design with gradients, animations, and responsive layout
- ✅ **Chat Interface**: Professional chat UI with avatars, typing indicators, and smooth animations
- ✅ **Data Layer**: Type-safe persona service with realistic Medicare beneficiary data
- ✅ **State Management**: Svelte stores with localStorage persistence and proper error handling
- ✅ **Routing**: Login/chat page routing with authentication guards
- ✅ **Mock Intent Recognition**: Simulated AI responses for drug pricing, plan info, and provider search

### Next Steps (To Be Implemented)

- 🔄 **AWS Bedrock Integration**: Claude 3 Haiku for intent recognition
- 🔄 **Medical Comprehend**: Drug and medical term extraction
- 🔄 **Conversation Logic**: Slot filling and follow-up questions
- 🔄 **API Layer**: Backend services for AI interactions

## 🎯 Core Features (POC Scope)

- **Intent Recognition**: Identify user intentions from natural language
- **Slot Filling**: Extract relevant information (drug names, dosages, etc.)
- **Conversational Flow**: Handle incomplete information with follow-up questions
- **Medical NER**: Use AWS Medical Comprehend for drug/medical term extraction
- **Mock Data Integration**: Simulate backend API responses
- **Zero Hallucination**: Strict adherence to provided data only

## 🎨 UI Features

### 🚀 **Modern Design System**

- **Gradient Backgrounds**: Beautiful blue-to-indigo gradients
- **Glass Morphism**: Subtle shadows and border effects
- **Responsive Layout**: Works perfectly on mobile, tablet, and desktop
- **Smooth Animations**: Fade-in effects, typing indicators, and loading states

### 💬 **Professional Chat Interface**

- **Avatar System**: Distinct user and assistant avatars with icons
- **Message Bubbles**: Rounded chat bubbles with proper spacing
- **Typing Indicators**: Animated dots showing assistant activity
- **Intent Recognition**: Visual badges showing detected intents and confidence scores
- **Error Handling**: User-friendly error messages with icons

### 🔐 **Enhanced Authentication**

- **Persona Cards**: Rich Medicare beneficiary profiles with detailed information
- **Visual Feedback**: Loading spinners, success indicators, and error states
- **Demo Mode Badges**: Clear indicators that this is a demonstration

## 🛠️ Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code quality
npm run format       # Format code with Prettier
npm run check        # Type check with svelte-check
```

## 🧪 Testing Strategy

- **Unit Tests**: Vitest for service/utility functions
- **Component Tests**: Testing Library + Vitest for Svelte components
- **Integration Tests**: API endpoint testing
- **Type Safety**: TypeScript strict mode + svelte-check

## 🔧 Development Guidelines

### Svelte 5 Runes (NOT Svelte 4!)

```typescript
// ✅ Correct (Svelte 5)
let count = $state(0);
let doubled = $derived(count * 2);
let { title }: Props = $props();

// ❌ Wrong (Svelte 4 - DO NOT USE)
let count = 0;
$: doubled = count * 2;
export let title;
```

### TypeScript Standards

- **NO** `any` types - use proper interfaces or `unknown`
- **ALWAYS** type function parameters and returns
- Use Result pattern for error handling
- Follow naming conventions in [Code Conventions](docs/CODE-CONVENTIONS.md)

### Environment Variables

- **Server-side**: `BEDROCK_REGION`, `DATABASE_URL`
- **Client-side**: `PUBLIC_APP_NAME`, `PUBLIC_API_BASE_URL` (PUBLIC\_ prefix required)

## 🤖 AI Development Support

This project includes rules files for AI coding assistants:

- **Cursor**: `.cursorrules`
- **WindSurf**: `.windsurfrules`

These files ensure AI assistants follow our Svelte 5 patterns and coding standards.

## 🔒 Security Notes

- **Environment Variables**: Server-side secrets in `.env` (gitignored)
- **Client Variables**: Only `PUBLIC_*` variables are exposed to browser
- **AWS Credentials**: Never commit to version control
- **Mock Data**: This POC uses simulated data only

## 📊 Success Metrics (POC)

- Intent Recognition: >95% accuracy
- Slot Filling: >90% accuracy
- Zero hallucination tolerance
- Response time: <5 seconds end-to-end
- TypeScript: 100% type coverage

## 🚫 Out of Scope (POC)

- Production deployment
- Real AWS infrastructure setup
- Live backend integrations
- User authentication
- Data persistence beyond session memory

## 📖 Learn More

- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Medical Comprehend](https://docs.aws.amazon.com/comprehend-medical/)

---

**Note**: This is a local development POC focused on exploring AWS Bedrock capabilities with modern web technologies. The application demonstrates best practices for AI integration while maintaining strict code quality standards.
