import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso } from '../models/cursos-realizados.model';

@Injectable({
  providedIn: 'root',
})
export class CursosService {
  private apiUrl = 'https://appt-z1np.onrender.com/api/cursos-realizados';

  constructor(private http: HttpClient) {}

  // =========================
  // Obtener cursos visibles
  // =========================
  getCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  // =========================
  // Crear curso con certificado opcional
  // =========================
  createCurso(data: Partial<Curso>, file?: File): Observable<Curso> {
    const formData = this.buildFormData(data, file);
    return this.http.post<Curso>(this.apiUrl, formData);
  }

  // =========================
  // Actualizar curso con certificado opcional
  // =========================
  updateCurso(id: string, data: Partial<Curso>, file?: File): Observable<Curso> {
    const formData = this.buildFormData(data, file);
    return this.http.put<Curso>(`${this.apiUrl}/${id}`, formData);
  }

  // =========================
  // Eliminar curso (soft delete)
  // =========================
  deleteCurso(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // =========================
  // Recuperar curso oculto
  // =========================
  recoverCurso(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/recover`, {});
  }

  // =========================
  // Descargar certificado
  // =========================
  descargarCertificado(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/certificado`, { responseType: 'blob' });
  }

  // =========================
  // Obtener cursos ocultos (solo admin)
  // =========================
  getHiddenCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}/hidden`);
  }

  // =========================
  // Función privada para construir FormData
  // =========================
  private buildFormData(data: Partial<Curso>, file?: File): FormData {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof Curso];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    if (file) formData.append('certificado', file);
    return formData;
  }
}
