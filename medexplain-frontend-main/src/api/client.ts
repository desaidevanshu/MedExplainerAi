import { auth, isFirebaseConfigured } from '../auth/firebase';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Gets the current Firebase ID token or null
 */
async function getAuthToken(): Promise<string | null> {
  try {
    if (isFirebaseConfigured && auth?.currentUser) {
      return await auth.currentUser.getIdToken();
    }
  } catch (err) {
    console.warn('Could not fetch Firebase token:', err);
  }
  return null;
}

/**
 * Centralized API client attaching Authorization header and parsing friendly errors
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData and not already Content-Type specified, set JSON
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !(headers as Record<string, string>)['Content-Type']
  ) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An unexpected server error occurred.';
      let errorData: any = null;

      try {
        errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Not JSON
        if (response.status === 400) {
          errorMessage = 'Invalid request. Please check the provided information.';
        } else if (response.status === 401) {
          errorMessage = 'Your session has expired. Please sign in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to access this resource.';
        } else if (response.status === 404) {
          errorMessage = 'The requested medical report or resource could not be found.';
        } else if (response.status === 413) {
          errorMessage = 'The file is too large to upload. Please choose a smaller file.';
        } else if (response.status >= 500) {
          errorMessage = 'The analysis service is temporarily unavailable. Please try again in a moment.';
        }
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Parse JSON
    return (await response.json()) as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network / timeout error
    if (error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.', 408);
    }
    throw new ApiError(
      'Unable to connect to the MedExplain server. Please check your network or try again.',
      0
    );
  }
}
