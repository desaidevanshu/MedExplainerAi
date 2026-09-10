import { apiRequest } from './client';
import { ChatRequest, ChatResponse } from '../types';

export async function sendChatMessage(
  question: string,
  options: {
    report_id?: string;
    language?: string;
    history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  } = {}
): Promise<ChatResponse> {
  const payload: ChatRequest = {
    question,
    report_id: options.report_id,
    language: options.language || 'en',
    history: options.history,
  };

  return apiRequest<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
