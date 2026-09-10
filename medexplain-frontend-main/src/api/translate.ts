import { apiRequest } from './client';
import { TranslateRequest, TranslateResponse } from '../types';

export async function translateText(text: string, language: string): Promise<string> {
  if (!text || language === 'en') {
    return text;
  }

  const payload: TranslateRequest = {
    text,
    language,
  };

  const response = await apiRequest<TranslateResponse>('/api/translate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.translated_text || text;
}
