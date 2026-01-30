import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoLaboral } from '../models/productos-laborales.model';

export interface DeleteResponse {
  message: string;
  producto?: ProductoLaboral;
}

@Injectable({ providedIn: 'root' })
export class ProductosLaboralesService {
  private apiUrl = 'http://localhost:4000/api/productos-laborales';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // JWT guardado en localStorage
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  /** ===========================
   *  PÚBLICO
   * =========================== */

  // Obtener productos visibles
  getProductos(): Observable<ProductoLaboral[]> {
    return this.http.get<ProductoLaboral[]>(this.apiUrl);
  }

  /** ===========================
   *  ADMIN
   * =========================== */

  // Crear producto laboral
  createProducto(producto: Partial<ProductoLaboral>): Observable<ProductoLaboral> {
    const payload: Partial<ProductoLaboral> = {
      nombreproducto: producto.nombreproducto?.trim(),
      descripcion: producto.descripcion?.trim(),
      fechaproducto: producto.fechaproducto,
      activarparaqueseveaenfront: producto.activarparaqueseveaenfront ?? true,
    };
    return this.http.post<ProductoLaboral>(this.apiUrl, payload, {
      headers: this.getHeaders(),
    });
  }

  // Actualizar producto laboral
  updateProducto(id: string, producto: Partial<ProductoLaboral>): Observable<ProductoLaboral> {
    return this.http.put<ProductoLaboral>(`${this.apiUrl}/${id}`, producto, {
      headers: this.getHeaders(),
    });
  }

  // Ocultar producto laboral (soft delete)
  deleteProducto(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Recuperar producto laboral oculto
  recoverProducto(id: string): Observable<DeleteResponse> {
    return this.http.patch<DeleteResponse>(`${this.apiUrl}/${id}/recover`, {}, {
      headers: this.getHeaders(),
    });
  }

  // Listar productos ocultos (solo admin)
  getHiddenProductos(): Observable<ProductoLaboral[]> {
    return this.http.get<ProductoLaboral[]>(`${this.apiUrl}/hidden`, {
      headers: this.getHeaders(),
    });
  }
}
