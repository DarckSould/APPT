import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExperienciaService } from '../../services/experiencia-laboral.service';
import { Experiencia } from '../../models/experiencia-laboral.model';

@Component({
  selector: 'app-experiencia-laboral',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './experiencias-laborales.component.html',
  styleUrls: ['./experiencias-laborales.component.css'],
})
export class ExperienciaLaboralComponent implements OnInit {
  experiencias: Experiencia[] = [];
  hiddenExperiencias: Experiencia[] = [];
  experienciaForm: FormGroup;
  selectedFile: File | null = null;
  editingId: string | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private experienciaService: ExperienciaService) {
    this.experienciaForm = this.fb.group({
      cargodesempenado: [''],
      nombrempresa: ['', Validators.required],
      lugarempresa: [''],
      emailempresa: [''],
      sitiowebempresa: [''],
      nombrecontactoempresarial: [''],
      telefonocontactoempresarial: [''],
      fechainiciogestion: ['', Validators.required],
      fechafingestion: [''],
      descripcionfunciones: [''],
      activarparaqueseveaenfront: [true],
    });
  }

  ngOnInit(): void {
    this.loadExperiencias();
    this.loadHiddenExperiencias();
  }

  // =========================
  // Cargar experiencias visibles
  // =========================
  loadExperiencias(): void {
    this.loading = true;
    this.experienciaService.getExperiencias().subscribe({
      next: (res) => {
        this.experiencias = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  // =========================
  // Cargar experiencias ocultas
  // =========================
  loadHiddenExperiencias(): void {
    this.loading = true;
    this.experienciaService.getHiddenExperiencias().subscribe({
      next: (res) => {
        this.hiddenExperiencias = res;
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
  // Crear o actualizar experiencia
  // =========================
  submitForm(): void {
    if (this.experienciaForm.invalid) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    const data: Partial<Experiencia> = { ...this.experienciaForm.value };
    const file = this.selectedFile ?? undefined;
    this.loading = true;

    const obs = this.editingId
      ? this.experienciaService.updateExperiencia(this.editingId, data, file)
      : this.experienciaService.createExperiencia(data, file);

    obs.subscribe({
      next: (res: Experiencia) => {
        if (this.editingId) {
          // Actualización: reemplazar en la lista correspondiente
          const indexVisible = this.experiencias.findIndex(r => r._id === this.editingId);
          const indexHidden = this.hiddenExperiencias.findIndex(r => r._id === this.editingId);
          if (indexVisible > -1) this.experiencias[indexVisible] = res;
          if (indexHidden > -1) this.hiddenExperiencias[indexHidden] = res;
        } else {
          // Creación: agregar a la lista correcta
          if (res.activarparaqueseveaenfront) this.experiencias.push(res);
          else this.hiddenExperiencias.push(res);
        }

        this.resetForm();
        this.loading = false;
        alert(`Experiencia ${this.editingId ? 'actualizada' : 'creada'} correctamente`);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error al guardar experiencia');
        this.loading = false;
      },
    });
  }

  // =========================
  // Preparar formulario para edición
  // =========================
  editExperiencia(exp: Experiencia): void {
    this.editingId = exp._id!;
    this.experienciaForm.patchValue({
      cargodesempenado: exp.cargodesempenado,
      nombrempresa: exp.nombrempresa,
      lugarempresa: exp.lugarempresa,
      emailempresa: exp.emailempresa,
      sitiowebempresa: exp.sitiowebempresa,
      nombrecontactoempresarial: exp.nombrecontactoempresarial,
      telefonocontactoempresarial: exp.telefonocontactoempresarial,
      fechainiciogestion: exp.fechainiciogestion,
      fechafingestion: exp.fechafingestion,
      descripcionfunciones: exp.descripcionfunciones,
      activarparaqueseveaenfront: exp.activarparaqueseveaenfront ?? true,
    });
    this.selectedFile = null;
  }

  // =========================
  // Eliminar experiencia (soft delete)
  // =========================
  deleteExperiencia(id: string): void {
    if (!confirm('⚠️ Esto ocultará la experiencia. ¿Continuar?')) return;

    this.experienciaService.deleteExperiencia(id).subscribe({
      next: () => {
        const index = this.experiencias.findIndex(r => r._id === id);
        if (index > -1) {
          const [exp] = this.experiencias.splice(index, 1);
          this.hiddenExperiencias.push(exp);
        }
        alert('Experiencia ocultada correctamente');
      },
      error: (err) => alert(err.error?.message || 'Error al ocultar experiencia'),
    });
  }

  // =========================
  // Recuperar experiencia oculta
  // =========================
  recoverExperiencia(id: string): void {
    this.experienciaService.recoverExperiencia(id).subscribe({
      next: () => {
        const index = this.hiddenExperiencias.findIndex(r => r._id === id);
        if (index > -1) {
          const [exp] = this.hiddenExperiencias.splice(index, 1);
          this.experiencias.push(exp);
        }
        alert('Experiencia recuperada correctamente');
      },
      error: (err) => alert(err.error?.message || 'Error al recuperar experiencia'),
    });
  }

  // =========================
  // Descargar certificado
  // =========================
  downloadCertificado(exp: Experiencia): void {
    if (!exp.rutacertificado || !exp._id) return;

    const filename = exp.rutacertificado.split('/').pop() ?? 'certificado.pdf';

    this.experienciaService.descargarCertificado(exp._id).subscribe((blob) => {
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
    this.experienciaForm.reset({ activarparaqueseveaenfront: true });
    this.selectedFile = null;
    this.editingId = null;
  }
}
