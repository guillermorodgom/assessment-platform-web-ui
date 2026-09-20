import { IntentoExamenResponse } from './intento.model';

export interface CandidatoConUltimoIntento {
  id: number;
  username: string;
  nombreCompleto: string;
  email: string;
  ultimoIntento: IntentoExamenResponse | null;
}
