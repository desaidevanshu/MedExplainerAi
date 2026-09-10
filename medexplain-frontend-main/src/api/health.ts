import { apiRequest } from './client';
import { HealthResponse } from '../types';

export async function fetchHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/api/health', {
    method: 'GET',
  });
}
