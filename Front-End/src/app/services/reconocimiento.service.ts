import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reconocimiento } from '../models/reconocimiento.model';

@Injectable({
  providedIn: 'root',
})
export class ReconocimientosService {
  private apiUrl = 'https://appt-z1np.onrender.com/api/reconocimientos';

  constructor(private http: HttpClient) {}

  // Obtener reconocimientos visibles
  getReconocimientos(): Observable<Reconocimiento[]> {
    return this.http.get<Reconocimiento[]>(this.apiUrl);
  }

  // Obtener reconocimientos ocultos (solo admin)
  getHiddenReconocimientos(): Observable<Reconocimiento[]> {
    return this.http.get<Reconocimiento[]>(`${this.apiUrl}/hidden`);
  }

  // Crear reconocimiento
  createReconocimiento(data: Partial<Reconocimiento>, file?: File): Observable<Reconocimiento> {
    const formData = this.buildFormData(data, file);
    return this.http.post<Reconocimiento>(this.apiUrl, formData);
  }

  // Actualizar reconocimiento
  updateReconocimiento(id: string, data: Partial<Reconocimiento>, file?: File): Observable<Reconocimiento> {
    const formData = this.buildFormData(data, file);
    return this.http.put<Reconocimiento>(`${this.apiUrl}/${id}`, formData);
  }

  // Soft delete (ocultar)
  deleteReconocimiento(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Recuperar reconocimiento
  recoverReconocimiento(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/recover`, {});
  }

  // Descargar certificado
  descargarCertificado(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/certificado`, { responseType: 'blob' });
  }

  // Función privada para construir FormData
  private buildFormData(data: Partial<Reconocimiento>, file?: File): FormData {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof Reconocimiento];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    if (file) formData.append('certificado', file);
    return formData;
  }
}
