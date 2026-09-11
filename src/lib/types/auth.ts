export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
}
