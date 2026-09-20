export interface CreateAsignacionRequest {
  cuestionarioId: number;
  candidatoId: number;
  disponibleDesde: string;
  disponibleHasta: string;
}

export interface AsignacionBatchRequest {
  cuestionarioId: number;
  candidatoIds: number[];
  disponibleDesde: string;
  disponibleHasta: string;
}

export interface AsignacionResponse {
  id: number;
  cuestionarioId: number;
  cuestionarioNombre: string;
  candidatoId: number;
  candidatoNombre: string;
  candidatoEmail: string;
  asignadoPorNombre: string;
  disponibleDesde: string;
  disponibleHasta: string;
  createdAt: string;
  estado: 'ACTIVA' | 'PENDIENTE' | 'EXPIRADA' | 'INACTIVA';
  tiempoLimite: number | null;
  maxIntentos: number;
  intentosUsados: number;
}

export interface UsuarioSimpleResponse {
  id: number;
  username: string;
  nombreCompleto: string;
  email: string;
}
