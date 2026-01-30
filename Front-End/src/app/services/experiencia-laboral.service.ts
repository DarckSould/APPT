import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Experiencia } from '../models/experiencia-laboral.model';

@Injectable({
  providedIn: 'root',
})
export class ExperienciaService {
  private apiUrl = 'https://appt-z1np.onrender.com/api/experiencia-laboral';

  constructor(private http: HttpClient) {}

  // =========================
  // Obtener todas las experiencias visibles
  // =========================
  getExperiencias(): Observable<Experiencia[]> {
    return this.http.get<Experiencia[]>(this.apiUrl);
  }

  // =========================
  // Crear experiencia
  // =========================
  createExperiencia(data: Partial<Experiencia>, file?: File): Observable<Experiencia> {
    const formData = this.buildFormData(data, file);
    return this.http.post<Experiencia>(this.apiUrl, formData);
  }

  // =========================
  // Actualizar experiencia
  // =========================
  updateExperiencia(id: string, data: Partial<Experiencia>, file?: File): Observable<Experiencia> {
    const formData = this.buildFormData(data, file);
    return this.http.put<Experiencia>(`${this.apiUrl}/${id}`, formData);
  }

  // =========================
  // Ocultar (soft delete) experiencia
  // =========================
  deleteExperiencia(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // =========================
  // Recuperar experiencia (undo soft delete)
  // =========================
  recoverExperiencia(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/recover`, {});
  }

  // =========================
  // Descargar certificado
  // =========================
  descargarCertificado(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/certificado`, { responseType: 'blob' });
  }

  // =========================
  // Obtener experiencias ocultas (solo admin)
  // =========================
  getHiddenExperiencias(): Observable<Experiencia[]> {
    return this.http.get<Experiencia[]>(`${this.apiUrl}/hidden`);
  }

  // =========================
  // Función privada para construir FormData
  // =========================
  private buildFormData(data: Partial<Experiencia>, file?: File): FormData {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof Experiencia];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    if (file) formData.append('certificado', file);
    return formData;
  }
}
