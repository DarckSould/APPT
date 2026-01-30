export type TipoReconocimiento = 'Académico' | 'Público' | 'Privado';

export interface Reconocimiento {
  _id?: string;
  idperfilconqueestaactivo: number;

  tiporeconocimiento: TipoReconocimiento;
  fechareconocimiento?: string;
  descripcionreconocimiento?: string;
  entidadpatrocinadora?: string;

  nombrecontactoauspicia?: string;
  telefonocontactoauspicia?: string;

  activarparaqueseveaenfront?: boolean;
  rutacertificado?: string;
  rutacertificados?: string[]; // soporte para varios archivos

  createdAt?: string;
  updatedAt?: string;
}
