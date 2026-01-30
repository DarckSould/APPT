export interface DatosPersonales {
  idperfil: number | null;

  descripcionperfil?: string;
  nombres: string;
  apellidos: string;
  nacionalidad?: string;
  lugarnacimiento?: string;

  fechanacimiento?: string; // siempre llega como string ISO desde el backend
  numerocedula?: string;

  sexo?: 'H' | 'M';
  estadocivil?: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Unión Libre' | 'Otro';

  licenciaconducir?: 'SI' | 'NO';

  telefonoconvencional?: string;
  telefonofijo?: string;

  direcciontrabajo?: string;
  direcciondomiciliaria?: string;

  sitioweb?: string;
  foto?: string; 

  createdAt?: string;
  updatedAt?: string;
}

// Tipos para responses que envuelven un perfil
export interface PerfilResponse {
  perfil: DatosPersonales;
  msg?: string;
}

export interface MessageResponse {
  message: string;
}
