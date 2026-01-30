import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReconocimientosService } from '../../services/reconocimiento.service';
import { Reconocimiento } from '../../models/reconocimiento.model';

@Component({
  selector: 'app-reconocimientos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reconocimientos.component.html',
  styleUrls: ['./reconocimientos.component.css'],
})
export class ReconocimientosComponent implements OnInit {
  reconocimientos: Reconocimiento[] = [];
  hiddenReconocimientos: Reconocimiento[] = [];
  reconocimientoForm: FormGroup;
  selectedFile: File | null = null;
  editingId: string | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private recService: ReconocimientosService) {
    this.reconocimientoForm = this.fb.group({
      tiporeconocimiento: ['', Validators.required],
      fechareconocimiento: ['', Validators.required],
      descripcionreconocimiento: [''],
      entidadpatrocinadora: [''],
      nombrecontactoauspicia: [''],
      telefonocontactoauspicia: [''],
      activarparaqueseveaenfront: [true],
    });
  }

  ngOnInit(): void {
    this.loadReconocimientos();
    this.loadHiddenReconocimientos();
  }

  // =========================
  // Cargar reconocimientos visibles
  // =========================
  loadReconocimientos(): void {
    this.loading = true;
    this.recService.getReconocimientos().subscribe({
      next: (res) => {
        this.reconocimientos = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  // =========================
  // Cargar reconocimientos ocultos
  // =========================
  loadHiddenReconocimientos(): void {
    this.loading = true;
    this.recService.getHiddenReconocimientos().subscribe({
      next: (res) => {
        this.hiddenReconocimientos = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  // =========================
  // Capturar archivo seleccionado
  // =========================
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  // =========================
  // Crear o actualizar reconocimiento
  // =========================
  submitForm(): void {
    if (this.reconocimientoForm.invalid) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    const data: Partial<Reconocimiento> = { ...this.reconocimientoForm.value };

    if (data.fechareconocimiento) {
      data.fechareconocimiento = new Date(data.fechareconocimiento).toISOString();
    }

    const file = this.selectedFile ?? undefined;
    this.loading = true;

    const obs = this.editingId
      ? this.recService.updateReconocimiento(this.editingId, data, file)
      : this.recService.createReconocimiento(data, file);

    obs.subscribe({
      next: (res: Reconocimiento) => {
        // Actualizar listas en memoria sin recargar toda la API
        if (this.editingId) {
          // Actualización: reemplazar en la lista correspondiente
          const indexVisible = this.reconocimientos.findIndex(r => r._id === this.editingId);
          const indexHidden = this.hiddenReconocimientos.findIndex(r => r._id === this.editingId);
          if (indexVisible > -1) this.reconocimientos[indexVisible] = res;
          if (indexHidden > -1) this.hiddenReconocimientos[indexHidden] = res;
        } else {
          // Creación: agregar a la lista correcta
          if (res.activarparaqueseveaenfront) this.reconocimientos.push(res);
          else this.hiddenReconocimientos.push(res);
        }

        this.resetForm();
        this.loading = false;
        alert(`Reconocimiento ${this.editingId ? 'actualizado' : 'creado'} correctamente`);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error al guardar reconocimiento');
        this.loading = false;
      },
    });
  }

  // =========================
  // Preparar formulario para edición
  // =========================
  editReconocimiento(rec: Reconocimiento): void {
    this.editingId = rec._id!;
    this.reconocimientoForm.patchValue({
      tiporeconocimiento: rec.tiporeconocimiento,
      fechareconocimiento: rec.fechareconocimiento?.split('T')[0] ?? '',
      descripcionreconocimiento: rec.descripcionreconocimiento,
      entidadpatrocinadora: rec.entidadpatrocinadora,
      nombrecontactoauspicia: rec.nombrecontactoauspicia,
      telefonocontactoauspicia: rec.telefonocontactoauspicia,
      activarparaqueseveaenfront: rec.activarparaqueseveaenfront ?? true,
    });
    this.selectedFile = null;
  }

  // =========================
  // Eliminar reconocimiento (soft delete)
  // =========================
  deleteReconocimiento(id: string): void {
    if (!confirm('⚠️ Esto ocultará el reconocimiento. ¿Continuar?')) return;
    this.recService.deleteReconocimiento(id).subscribe({
      next: () => {
        const index = this.reconocimientos.findIndex(r => r._id === id);
        if (index > -1) {
          const [rec] = this.reconocimientos.splice(index, 1);
          this.hiddenReconocimientos.push(rec);
        }
        alert('Reconocimiento ocultado correctamente');
      },
      error: (err) => alert(err.error?.message || 'Error al ocultar reconocimiento'),
    });
  }

  // =========================
  // Recuperar reconocimiento oculto
  // =========================
  recoverReconocimiento(id: string): void {
    this.recService.recoverReconocimiento(id).subscribe({
      next: () => {
        const index = this.hiddenReconocimientos.findIndex(r => r._id === id);
        if (index > -1) {
          const [rec] = this.hiddenReconocimientos.splice(index, 1);
          this.reconocimientos.push(rec);
        }
        alert('Reconocimiento recuperado correctamente');
      },
      error: (err) => alert(err.error?.message || 'Error al recuperar reconocimiento'),
    });
  }

  // =========================
  // Descargar certificado
  // =========================
  downloadCertificado(rec: Reconocimiento): void {
    if (!rec.rutacertificado || !rec._id) return;

    const filename = rec.rutacertificado.split('/').pop() ?? 'certificado.pdf';

    this.recService.descargarCertificado(rec._id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // =========================
  // Reiniciar formulario
  // =========================
  resetForm(): void {
    this.reconocimientoForm.reset({ activarparaqueseveaenfront: true });
    this.selectedFile = null;
    this.editingId = null;
  }
}
