export interface Curso {
  _id?: string;
  idperfilconqueestaactivo: number;

  nombrecurso: string;
  fechainicio: string; // ISO string para input type="date"
  fechafin?: string;

  totalhoras?: number;
  descripcioncurso?: string;
  entidadpatrocinadora?: string;

  nombrecontactoauspicia?: string;
  telefonocontactoauspicia?: string;
  emailempresapatrocinadora?: string;

  activarparaqueseveaenfront?: boolean;
  rutacertificado?: string;
  rutacertificados?: string[]; // para actualizar múltiples certificados

  createdAt?: string;
  updatedAt?: string;
}
