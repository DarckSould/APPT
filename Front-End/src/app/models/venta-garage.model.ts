export interface VentaGarage {
  _id?: string;
  idperfilconqueestaactivo?: number;
  nombreproducto: string;
  estadoproducto?: 'Bueno' | 'Regular';
  descripcion?: string;
  valordelbien: number;
  foto?: string;
  activarparaqueseveaenfront?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
