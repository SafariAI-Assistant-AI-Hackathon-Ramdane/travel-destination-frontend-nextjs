export type MessageRole = 'user' | 'safari';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  cards?: any[];
  contextDocs?: any[];
  model?: string;
  isError?: boolean;
}

export const createUserMessage = (text: string): Message => ({
  id: `msg-user-${Date.now()}`,
  role: 'user',
  text,
  timestamp: new Date(),
});

export const createBotMessage = (text: string, options: { cards?: any[], contextDocs?: any[], model?: string } = {}): Message => ({
  id: `msg-safari-${Date.now()}`,
  role: 'safari',
  text,
  timestamp: new Date(),
  ...options
});

export const createErrorMessage = (text: string): Message => ({
  id: `msg-error-${Date.now()}`,
  role: 'safari',
  text,
  timestamp: new Date(),
  isError: true,
});
