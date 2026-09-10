import { apiRequest } from './client';
import { UploadResponse } from '../types';

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export const ACCEPTED_FILE_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function validateMedicalFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select a file to upload.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty. Please choose a valid medical report.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 15 MB.`,
    };
  }

  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidExt = ACCEPTED_FILE_EXTENSIONS.includes(fileExt);
  const isValidMime = ACCEPTED_FILE_TYPES.includes(file.type);

  if (!isValidExt && !isValidMime) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a PDF or image (JPG, PNG).',
    };
  }

  return { valid: true };
}

export async function uploadReportFile(file: File): Promise<UploadResponse> {
  const validation = validateMedicalFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<UploadResponse>('/api/upload', {
    method: 'POST',
    body: formData,
  });
}
