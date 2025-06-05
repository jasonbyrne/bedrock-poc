# Intent Controller Pattern

## Overview

The Medicare Chatbot uses a controller-based architecture to handle user intents. This document provides a high-level overview of this pattern.

## Folder Structure

```
src/lib/server/
├── controllers/           # Intent-specific controllers
│   ├── WelcomeController.ts
│   ├── GetDrugPriceController.ts
│   ├── GetPlanInfoController.ts
│   ├── FindProviderController.ts
│   └── UnknownController.ts
├── core/
│   └── controller.ts      # Abstract Controller class
└── router.ts             # Maps intents to controllers
```

## Core Concepts

### Intent Controllers

Each intent has a dedicated controller class that handles the specific logic for that intent. Controllers are responsible for:

- Processing intent-specific logic
- Handling confidence thresholds
- Generating appropriate responses

### Router

The router maps intent names to their corresponding controllers and handles the flow of:  
1. Receiving the detected intent
2. Routing to the appropriate controller
3. Processing the controller's response
4. Saving the response to the session history

## Adding a New Intent

To add support for a new intent:

1. Create a new controller file in `src/lib/server/controllers/`
2. Add the controller to the intent map in `router.ts`

## Future Development

This architecture is designed to be flexible and may evolve as the project grows. The implementation details may change, but the core concept of dedicated controllers for each intent will remain.
