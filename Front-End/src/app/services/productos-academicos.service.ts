import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoAcademico } from '../models/productos-academicos.model';

export interface DeleteResponse {
  message: string;
  producto?: ProductoAcademico;
}

@Injectable({ providedIn: 'root' })
export class ProductosAcademicosService {
  private apiUrl = 'http://localhost:4000/api/productos-academicos';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // JWT guardado en el localStorage
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  /** ===========================
   *  PÚBLICO
   * =========================== */

  // Obtener productos visibles en front
  getProductos(): Observable<ProductoAcademico[]> {
    return this.http.get<ProductoAcademico[]>(this.apiUrl);
  }

  /** ===========================
   *  ADMIN
   * =========================== */

  // Crear producto académico
  createProducto(producto: Partial<ProductoAcademico>): Observable<ProductoAcademico> {
    const payload: Partial<ProductoAcademico> = {
      nombrerecurso: producto.nombrerecurso?.trim(),
      clasificador: producto.clasificador?.trim(),
      descripcion: producto.descripcion?.trim(),
      activarparaqueseveaenfront: producto.activarparaqueseveaenfront ?? true,
    };
    return this.http.post<ProductoAcademico>(this.apiUrl, payload, {
      headers: this.getHeaders(),
    });
  }

  // Actualizar producto académico
  updateProducto(id: string, producto: Partial<ProductoAcademico>): Observable<ProductoAcademico> {
    return this.http.put<ProductoAcademico>(`${this.apiUrl}/${id}`, producto, {
      headers: this.getHeaders(),
    });
  }

  // Ocultar producto académico (soft delete)
  deleteProducto(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Recuperar producto académico oculto
  recoverProducto(id: string): Observable<DeleteResponse> {
    return this.http.patch<DeleteResponse>(`${this.apiUrl}/${id}/recover`, {}, {
      headers: this.getHeaders(),
    });
  }

  // Listar productos ocultos (solo admin)
  getHiddenProductos(): Observable<ProductoAcademico[]> {
    return this.http.get<ProductoAcademico[]>(`${this.apiUrl}/hidden`, {
      headers: this.getHeaders(),
    });
  }
}
