import { apiRequest } from './client';
import { Report } from '../types';
import { normalizeReport } from './analysis';

export async function fetchDemoInfo(): Promise<any> {
  return apiRequest<any>('/api/demo', {
    method: 'GET',
  });
}

export async function analyzeDemoReport(language: string = 'en'): Promise<Report> {
  const query = language ? `?language=${encodeURIComponent(language)}` : '';
  const raw = await apiRequest<any>(`/api/demo/analyze${query}`, {
    method: 'POST',
  });
  const normalized = normalizeReport(raw);
  if (!normalized.filename || normalized.filename === 'Medical Report') {
    normalized.filename = 'Sample Comprehensive Metabolic Panel (Demo)';
  }
  normalized.extraction_method = 'demo';
  return normalized;
}
