import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaGarage } from '../models/venta-garage.model';

export interface DeleteResponse {
  message: string;
  producto?: VentaGarage;
}

@Injectable({ providedIn: 'root' })
export class VentaGarageService {
  private apiUrl = 'http://localhost:4000/api/venta-garage';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // =========================
  // Obtener productos visibles
  // =========================
  getProductos(): Observable<VentaGarage[]> {
    return this.http.get<VentaGarage[]>(this.apiUrl);
  }

  // =========================
  // Crear producto (admin)
  // =========================
  createProducto(data: Partial<VentaGarage>, foto?: File): Observable<VentaGarage> {
    const formData = this.buildFormData(data, foto);
    return this.http.post<VentaGarage>(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  // =========================
  // Actualizar producto (admin)
  // =========================
  updateProducto(id: string, data: Partial<VentaGarage>, foto?: File): Observable<VentaGarage> {
    const formData = this.buildFormData(data, foto);
    return this.http.put<VentaGarage>(`${this.apiUrl}/${id}`, formData, { headers: this.getHeaders() });
  }

  // =========================
  // Subir/Actualizar solo foto de producto (admin)
  // =========================
  updateFotoProducto(id: string, foto: File): Observable<{ message: string; producto: VentaGarage }> {
    const formData = new FormData();
    formData.append('foto', foto);
    return this.http.post<{ message: string; producto: VentaGarage }>(
      `${this.apiUrl}/${id}/foto`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // Ocultar producto (soft delete)
  // =========================
  deleteProducto(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // =========================
  // Recuperar producto oculto (undo soft delete)
  // =========================
  recoverProducto(id: string): Observable<DeleteResponse> {
    return this.http.patch<DeleteResponse>(`${this.apiUrl}/${id}/recover`, {}, { headers: this.getHeaders() });
  }

  // =========================
  // Obtener productos ocultos (solo admin)
  // =========================
  getHiddenProductos(): Observable<VentaGarage[]> {
    return this.http.get<VentaGarage[]>(`${this.apiUrl}/hidden`, { headers: this.getHeaders() });
  }

  // =========================
  // Función privada para construir FormData
  // =========================
  private buildFormData(data: Partial<VentaGarage>, foto?: File): FormData {
    if (!data.nombreproducto || data.nombreproducto.trim() === '') {
      throw new Error('El campo "nombreproducto" es obligatorio.');
    }

    if (data.valordelbien === undefined || data.valordelbien === null) {
      throw new Error('El campo "valordelbien" es obligatorio.');
    }

    const formData = new FormData();

    // Campos obligatorios
    formData.append('nombreproducto', data.nombreproducto);
    formData.append('valordelbien', data.valordelbien.toString());

    // Campos opcionales
    Object.keys(data).forEach((key) => {
      if (key === 'nombreproducto' || key === 'valordelbien') return;
      const value = data[key as keyof VentaGarage];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (foto) formData.append('foto', foto);

    return formData;
  }
}
