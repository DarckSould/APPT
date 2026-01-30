import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosAcademicosService,  } from '../../services/productos-academicos.service';
import { ProductoAcademico } from '../../models/productos-academicos.model';
@Component({
  selector: 'app-productos-academicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos-academicos.component.html',
  styleUrls: ['./productos-academicos.component.css'],
})
export class ProductosAcademicosComponent implements OnInit {
  productos: ProductoAcademico[] = [];
  productoForm: FormGroup;
  editingId: string | null = null;
  loading = false;
  mensaje: string = '';

  constructor(private fb: FormBuilder, private productosService: ProductosAcademicosService) {
    this.productoForm = this.fb.group({
      nombrerecurso: ['', [Validators.required, Validators.maxLength(100)]],
      clasificador: ['', Validators.maxLength(100)],
      descripcion: ['', Validators.maxLength(100)],
      activarparaqueseveaenfront: [true],
    });
  }

  ngOnInit() {
    this.loadProductos();
  }

  // ===========================
  // Cargar productos visibles
  // ===========================
  loadProductos() {
    this.productosService.getProductos().subscribe({
      next: (res) => (this.productos = res),
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }

  // ===========================
  // Enviar formulario (crear o actualizar)
  // ===========================
  submitForm() {
    if (this.productoForm.invalid) return;

    const data: Partial<ProductoAcademico> = this.productoForm.value;

    if (this.editingId) {
      // Actualizar
      this.productosService.updateProducto(this.editingId, data).subscribe({
        next: () => {
          this.mensaje = 'Producto actualizado';
          this.resetForm();
          this.loadProductos();
        },
        error: (err) => (this.mensaje = err.error?.message || err.message),
      });
    } else {
      // Crear
      this.productosService.createProducto(data).subscribe({
        next: () => {
          this.mensaje = 'Producto creado';
          this.resetForm();
          this.loadProductos();
        },
        error: (err) => (this.mensaje = err.error?.message || err.message),
      });
    }
  }

  // ===========================
  // Editar producto (llenar formulario)
  // ===========================
  editProducto(producto: ProductoAcademico) {
    this.editingId = producto._id || null;
    this.productoForm.patchValue({
      nombrerecurso: producto.nombrerecurso,
      clasificador: producto.clasificador,
      descripcion: producto.descripcion,
      activarparaqueseveaenfront: producto.activarparaqueseveaenfront ?? true,
    });
  }

  // ===========================
  // Eliminar producto (soft delete)
  // ===========================
  deleteProducto(producto: ProductoAcademico) {
    if (!producto._id) return;
    this.productosService.deleteProducto(producto._id).subscribe({
      next: (res) => {
        this.mensaje = res.message;
        this.loadProductos();
      },
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }

  // ===========================
  // Recuperar producto oculto
  // ===========================
  recoverProducto(producto: ProductoAcademico) {
    if (!producto._id) return;
    this.productosService.recoverProducto(producto._id).subscribe({
      next: (res) => {
        this.mensaje = res.message;
        this.loadProductos();
      },
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }

  // ===========================
  // Reiniciar formulario
  // ===========================
  resetForm() {
    this.productoForm.reset({ activarparaqueseveaenfront: true });
    this.editingId = null;
    this.mensaje = '';
  }

  // ===========================
  // Listar productos ocultos (solo admin)
  // ===========================
  loadHiddenProductos() {
    this.productosService.getHiddenProductos().subscribe({
      next: (res) => (this.productos = res),
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }
}
