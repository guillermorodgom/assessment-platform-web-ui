import { TipoPregunta, LenguajeProgramacion } from './enums.model';

export interface CreatePreguntaRequest {
  titulo: string;
  descripcion?: string;
  tipoPregunta: TipoPregunta;
  lenguajesPermitidos?: LenguajeProgramacion[];
  puntaje: number;
}

export interface UpdatePreguntaRequest {
  titulo?: string;
  descripcion?: string;
  tipoPregunta?: TipoPregunta;
  lenguajesPermitidos?: LenguajeProgramacion[];
  puntaje?: number;
}

export interface CreateOpcionRequest {
  texto: string;
  esCorrecta: boolean;
}

export interface OpcionRespuestaResponse {
  id: number;
  texto: string;
  esCorrecta: boolean;
}

export interface CreateCasoDePruebaRequest {
  input?: string;
  expectedOutput: string;
}

export interface CasoDePruebaResponse {
  id: number;
  input: string;
  expectedOutput: string;
}

export interface CuestionarioSimple {
  id: number;
  nombre: string;
}

export interface PreguntaResponse {
  id: number;
  titulo: string;
  descripcion: string;
  tipoPregunta: TipoPregunta;
  lenguajesPermitidos: LenguajeProgramacion[];
  puntaje: number;
  cuestionarios: CuestionarioSimple[];
  opciones: OpcionRespuestaResponse[];
  casosDePrueba: CasoDePruebaResponse[];
}
