export interface ApiError {
  timestamp?: string;
  status: number;
  error: string;
  message?: string;
  messages?: string[];
  path?: string;
}

export function apiErrorMessage(error: ApiError | null | undefined): string {
  if (!error) {
    return 'An unexpected error occurred.';
  }
  if (error.messages && error.messages.length > 0) {
    return error.messages.join('. ');
  }
  if (error.message) {
    return error.message;
  }
  return error.error || 'An unexpected error occurred.';
}