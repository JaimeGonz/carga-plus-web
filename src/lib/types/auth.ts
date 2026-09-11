export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
}
