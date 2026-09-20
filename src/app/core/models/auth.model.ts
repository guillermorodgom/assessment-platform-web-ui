export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  nombreCompleto: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  nombreCompleto: string;
  roles: string[];
}

export interface UserInfoResponse {
  id: number;
  username: string;
  email: string;
  nombreCompleto: string;
  roles: string[];
}

export interface UsuarioResponse {
  id: number;
  username: string;
  nombreCompleto: string;
  email: string;
  roles: string[];
}
