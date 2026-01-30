import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatosPersonales, PerfilResponse, MessageResponse } from '../models/datos-personales.model';

@Injectable({
  providedIn: 'root',
})
export class DatosPersonalesService {
  private apiUrl = 'https://appt-z1np.onrender.com/api/datos-personales';

  constructor(private http: HttpClient) {}

  /* =========================
     PERFIL PÚBLICO
  ========================= */
  getPerfil(): Observable<DatosPersonales> {
    return this.http.get<DatosPersonales>(this.apiUrl);
  }

  /* =========================
     CREAR / ACTUALIZAR PERFIL (ADMIN)
     (SOLO DATOS, SIN FOTO)
  ========================= */
  guardarPerfil(data: Partial<DatosPersonales>): Observable<DatosPersonales> {
    return this.http.post<DatosPersonales>(this.apiUrl, data);
  }

  /* =========================
     SUBIR / ACTUALIZAR FOTO (ADMIN)
     Devuelve { msg, perfil }
  ========================= */
  subirFoto(foto: File): Observable<PerfilResponse> {
    const formData = new FormData();
    formData.append('foto', foto);

    return this.http.post<PerfilResponse>(`${this.apiUrl}/foto`, formData);
  }

  /* =========================
     OBTENER URL COMPLETA DE FOTO
  ========================= */
  getFotoUrl(foto?: string): string {
    return foto ? `https://appt-z1np.onrender.com${foto}` : '';
  }

  /* =========================
     ELIMINAR PERFIL (SOFT DELETE)
     Devuelve { message }
  ========================= */
  eliminarPerfil(): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(this.apiUrl);
  }

  /* =========================
     RECUPERAR PERFIL
     Devuelve { message, perfil }
  ========================= */
  recuperarPerfil(): Observable<PerfilResponse & MessageResponse> {
    return this.http.patch<PerfilResponse & MessageResponse>(`${this.apiUrl}/recover`, {});
  }

  /* =========================
     PERFIL OCULTO (ADMIN)
  ========================= */
  getPerfilOculto(): Observable<DatosPersonales> {
    return this.http.get<DatosPersonales>(`${this.apiUrl}/hidden`);
  }
}
