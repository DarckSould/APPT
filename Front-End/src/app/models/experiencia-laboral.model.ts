export interface Experiencia {
  _id?: string;
  idperfilconqueestaactivo: number;

  cargodesempenado?: string;
  nombrempresa: string;
  lugarempresa?: string;
  emailempresa?: string;
  sitiowebempresa?: string;
  nombrecontactoempresarial?: string;
  telefonocontactoempresarial?: string;

  fechainiciogestion: string;
  fechafingestion?: string;

  descripcionfunciones?: string;
  activarparaqueseveaenfront?: boolean;
  rutacertificado?: string;
  rutacertificados?: string[]; // para varios archivos

  createdAt?: string;
  updatedAt?: string;
}
