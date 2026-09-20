export interface CreateCuestionarioRequest {
  nombre: string;
  descripcion: string;
  tiempoLimite: number;
  maxIntentos: number;
}

export interface UpdateCuestionarioRequest {
  nombre?: string;
  descripcion?: string;
  tiempoLimite?: number;
  maxIntentos?: number;
  activo?: boolean;
}

export interface CuestionarioResponse {
  id: number;
  nombre: string;
  descripcion: string;
  tiempoLimite: number;
  cantidadPreguntas: number;
  maxIntentos: number;
  activo: boolean;
  creadoPor: string;
  createdAt: string;
}
