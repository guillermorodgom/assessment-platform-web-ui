import { EstadoIntento, ResultadoEjecucion, LenguajeProgramacion } from './enums.model';

export interface IniciarIntentoRequest {
  cuestionarioId: number;
}

export interface EnviarRespuestaRequest {
  preguntaId: number;
  codigoFuente?: string;
  lenguaje?: LenguajeProgramacion;
  opcionesSeleccionadas?: number[];
}

export interface IntentoExamenResponse {
  id: number;
  candidatoId: number;
  candidatoNombre: string;
  cuestionarioId: number;
  cuestionarioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoIntento;
  puntajeTotal: number;
  puntajeMaximo: number;
  tiempoConsumido: number;
}

export interface RespuestaCandidatoResponse {
  id: number;
  preguntaId: number;
  preguntaTitulo: string;
  codigoFuente: string;
  lenguaje: LenguajeProgramacion;
  opcionesSeleccionadas: number[];
  resultadoEjecucion: ResultadoEjecucion;
  salidaObtenida: string;
  esCorrecta: boolean;
  puntajeObtenido: number;
}

export interface ResultadoIntentoResponse extends IntentoExamenResponse {
  respuestas: RespuestaCandidatoResponse[];
}
