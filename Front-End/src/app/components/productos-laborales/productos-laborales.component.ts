import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosLaboralesService } from '../../services/productos-laborales.service';
import { ProductoLaboral } from '../../models/productos-laborales.model';
@Component({
  selector: 'app-productos-laborales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos-laborales.component.html',
  styleUrls: ['./productos-laborales.component.css'],
})
export class ProductosLaboralesComponent implements OnInit {
  productos: ProductoLaboral[] = [];
  productoForm: FormGroup;
  editingId: string | null = null;
  loading = false;
  mensaje: string = '';

  constructor(private fb: FormBuilder, private productosService: ProductosLaboralesService) {
    this.productoForm = this.fb.group({
      nombreproducto: ['', [Validators.required, Validators.maxLength(100)]],
      fechaproducto: [''],
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

    const data: Partial<ProductoLaboral> = this.productoForm.value;

    if (this.editingId) {
      this.productosService.updateProducto(this.editingId, data).subscribe({
        next: () => {
          this.mensaje = 'Producto actualizado';
          this.resetForm();
          this.loadProductos();
        },
        error: (err) => (this.mensaje = err.error?.message || err.message),
      });
    } else {
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
  editProducto(producto: ProductoLaboral) {
    this.editingId = producto._id || null;
    this.productoForm.patchValue({
      nombreproducto: producto.nombreproducto,
      fechaproducto: producto.fechaproducto?.substring(0, 10), // yyyy-MM-dd
      descripcion: producto.descripcion,
      activarparaqueseveaenfront: producto.activarparaqueseveaenfront ?? true,
    });
  }

  // ===========================
  // Ocultar producto laboral (soft delete)
  // ===========================
  deleteProducto(producto: ProductoLaboral) {
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
  // Recuperar producto laboral oculto
  // ===========================
  recoverProducto(producto: ProductoLaboral) {
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
  // Cargar productos ocultos (solo admin)
  // ===========================
  loadHiddenProductos() {
    this.productosService.getHiddenProductos().subscribe({
      next: (res) => (this.productos = res),
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
}
