import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VentaGarageService } from '../../services/venta-garage.service';
import { VentaGarage } from '../../models/venta-garage.model';

@Component({
  selector: 'app-venta-garage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './venta-garage.component.html',
  styleUrls: ['./venta-garage.component.css'],
})
export class VentaGarageComponent implements OnInit {
  productos: VentaGarage[] = [];
  productoForm: FormGroup;
  editingId: string | null = null;
  loading = false;
  mensaje: string = '';
  selectedFile: File | null = null;

  estados = ['Bueno', 'Regular'];
  isViewingHidden: boolean = false;

  constructor(private fb: FormBuilder, private ventaService: VentaGarageService) {
    this.productoForm = this.fb.group({
      nombreproducto: ['', [Validators.required, Validators.maxLength(100)]],
      estadoproducto: ['Bueno'],
      descripcion: ['', Validators.maxLength(100)],
      valordelbien: [0, [Validators.required, Validators.min(0)]],
      activarparaqueseveaenfront: [true],
      foto: [null],
    });
  }

  ngOnInit() {
    this.loadProductos();
  }

  getFotoUrl(foto?: string): string {
    return foto ? `https://appt-z1np.onrender.com${foto}` : '';
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length) {
      this.selectedFile = event.target.files[0];
    }
  }

  loadProductos() {
    this.isViewingHidden = false;
    this.ventaService.getProductos().subscribe({
      next: (res) => (this.productos = res),
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }

  loadHiddenProductos() {
    this.isViewingHidden = true;
    this.ventaService.getHiddenProductos().subscribe({
      next: (res) => (this.productos = res),
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }

  submitForm() {
    if (this.productoForm.invalid) return;

    const formValue = this.productoForm.value;
    const data: Partial<VentaGarage> = {
      ...formValue,
      valordelbien: Number(formValue.valordelbien),
    };

    if (this.editingId) {
      this.ventaService.updateProducto(this.editingId, data, this.selectedFile || undefined).subscribe({
        next: (res: VentaGarage) => {
          // Actualización en memoria
          const index = this.productos.findIndex(p => p._id === this.editingId);
          if (index > -1) this.productos[index] = res;
          this.mensaje = 'Producto actualizado';
          this.resetForm();
        },
        error: (err) => (this.mensaje = err.error?.message || err.message),
      });
    } else {
      this.ventaService.createProducto(data, this.selectedFile || undefined).subscribe({
        next: (res: VentaGarage) => {
          // Agregar en memoria según activarparaqueseveaenfront
          if (res.activarparaqueseveaenfront === !this.isViewingHidden) this.productos.push(res);
          this.mensaje = 'Producto creado';
          this.resetForm();
        },
        error: (err) => (this.mensaje = err.error?.message || err.message),
      });
    }
  }

  editProducto(producto: VentaGarage) {
    this.editingId = producto._id || null;
    this.productoForm.patchValue({
      nombreproducto: producto.nombreproducto,
      estadoproducto: producto.estadoproducto || 'Bueno',
      descripcion: producto.descripcion,
      valordelbien: producto.valordelbien,
      activarparaqueseveaenfront: producto.activarparaqueseveaenfront ?? true,
      foto: null,
    });
    this.selectedFile = null;
  }

  uploadFoto(producto: VentaGarage) {
    if (!this.selectedFile || !producto._id) return;

    this.ventaService.updateFotoProducto(producto._id, this.selectedFile).subscribe({
      next: (res) => {
        this.mensaje = res.message;
        const index = this.productos.findIndex(p => p._id === producto._id);
        if (index !== -1) this.productos[index].foto = res.producto.foto;
        this.resetForm();
      },
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }

  deleteProducto(producto: VentaGarage) {
    if (!producto._id) return;

    this.ventaService.deleteProducto(producto._id).subscribe({
      next: () => {
        const index = this.productos.findIndex(p => p._id === producto._id);
        if (index !== -1) {
          const [prod] = this.productos.splice(index, 1);
          // Si estás viendo productos ocultos, no agregamos de nuevo; sino los ocultos podrían ir a otra lista
        }
        this.mensaje = 'Producto ocultado correctamente';
      },
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }

  recoverProducto(producto: VentaGarage) {
    if (!producto._id) return;

    this.ventaService.recoverProducto(producto._id).subscribe({
      next: () => {
        const index = this.productos.findIndex(p => p._id === producto._id);
        if (index !== -1) this.productos.splice(index, 1);
        this.mensaje = 'Producto recuperado correctamente';
        // Opcional: podrías agregarlo a otra lista de productos visibles si quieres
      },
      error: (err) => (this.mensaje = err.error?.message || err.message),
    });
  }

  resetForm() {
    this.productoForm.reset({
      activarparaqueseveaenfront: true,
      estadoproducto: 'Bueno',
      valordelbien: 0,
      foto: null,
    });
    this.editingId = null;
    this.selectedFile = null;
    this.mensaje = '';
  }
}
