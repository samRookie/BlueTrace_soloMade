/**
 * Generic request payload for AI text generation or synthesis operations.
 */
export interface AIGenerationRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Generic response payload for AI generation operations.
 */
export interface AIGenerationResult {
  content: string;
  modelIdentifier?: string;
  finishReason?: 'STOP' | 'LENGTH' | 'FILTER' | 'ERROR';
}

/**
 * Provider-neutral interface for artificial intelligence operations.
 *
 * NOTE: Credentials and API keys must be configured in application runtime infrastructure,
 * never passed through domain adapter arguments.
 */
export interface AIAdapter {
  generateText(request: AIGenerationRequest): Promise<AIGenerationResult>;
  summarize(text: string, options?: { maxLength?: number }): Promise<string>;
}
