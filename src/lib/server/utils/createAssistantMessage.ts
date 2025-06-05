import { nanoid } from 'nanoid';
import type { ChatMessage } from '$lib/types/intentTypes';

interface CreateAssistantMessageArgs {
  content: string;
  intent: string;
  slots?: Record<string, unknown>;
  confidence: number;
  started_at: number;
}

export function createAssistantMessage({
  content,
  intent,
  slots,
  confidence,
  started_at
}: CreateAssistantMessageArgs): ChatMessage {
  return {
    id: nanoid(12),
    content,
    role: 'assistant',
    timestamp: new Date(),
    metadata: {
      intent,
      slots,
      confidence_score: confidence,
      processing_time_ms: Date.now() - started_at
    }
  };
}
