export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
