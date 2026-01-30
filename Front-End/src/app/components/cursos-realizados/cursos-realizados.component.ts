import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursosService } from '../../services/cursos-realizados.service';
import { Curso } from '../../models/cursos-realizados.model';

@Component({
  selector: 'app-cursos-realizados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cursos-realizados.component.html',
  styleUrls: ['./cursos-realizados.component.css'],
})
export class CursosRealizadosComponent implements OnInit {
  cursos: Curso[] = [];
  hiddenCursos: Curso[] = [];
  cursoForm: FormGroup;
  selectedFile: File | null = null;
  editingId: string | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private cursosService: CursosService) {
    this.cursoForm = this.fb.group({
      nombrecurso: ['', Validators.required],
      fechainicio: ['', Validators.required],
      fechafin: [''],
      totalhoras: [''],
      descripcioncurso: [''],
      entidadpatrocinadora: [''],
      nombrecontactoauspicia: [''],
      telefonocontactoauspicia: [''],
      emailempresapatrocinadora: [''],
      activarparaqueseveaenfront: [true],
    });
  }

  ngOnInit() {
    this.loadCursos();
  }

  // =========================
  // Cargar cursos visibles
  // =========================
  loadCursos(): void {
    this.loading = true;
    this.cursosService.getCursos().subscribe({
      next: (res) => {
        this.cursos = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  // =========================
  // Cargar cursos ocultos (solo admin)
  // =========================
  loadHiddenCursos(): void {
    this.loading = true;
    this.cursosService.getHiddenCursos().subscribe({
      next: (res) => {
        this.hiddenCursos = res;
        this.loading = false;
      },
      error: () => {
        this.hiddenCursos = [];
        this.loading = false;
      },
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
  // Guardar o actualizar curso
  // =========================
  submitForm(): void {
    if (this.cursoForm.invalid) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    const data: Partial<Curso> = { ...this.cursoForm.value };
    const file = this.selectedFile ?? undefined;

    this.loading = true;

    const obs = this.editingId
      ? this.cursosService.updateCurso(this.editingId, data, file)
      : this.cursosService.createCurso(data, file);

    obs.subscribe({
      next: () => {
        this.loadCursos();
        this.loadHiddenCursos();
        this.resetForm();
        this.loading = false;
        alert(`Curso ${this.editingId ? 'actualizado' : 'creado'} correctamente`);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error al guardar curso');
        this.loading = false;
      },
    });
  }

  // =========================
  // Preparar formulario para edición
  // =========================
  editCurso(curso: Curso): void {
    this.editingId = curso._id!;
    this.cursoForm.patchValue({
      nombrecurso: curso.nombrecurso,
      fechainicio: curso.fechainicio,
      fechafin: curso.fechafin,
      totalhoras: curso.totalhoras,
      descripcioncurso: curso.descripcioncurso,
      entidadpatrocinadora: curso.entidadpatrocinadora,
      nombrecontactoauspicia: curso.nombrecontactoauspicia,
      telefonocontactoauspicia: curso.telefonocontactoauspicia,
      emailempresapatrocinadora: curso.emailempresapatrocinadora,
      activarparaqueseveaenfront: curso.activarparaqueseveaenfront ?? true,
    });
    this.selectedFile = null;
  }

  // =========================
  // Eliminar curso (soft delete)
  // =========================
  deleteCurso(id: string): void {
    if (!confirm('⚠️ Esto ocultará el curso. ¿Continuar?')) return;
    this.cursosService.deleteCurso(id).subscribe({
      next: () => {
        this.loadCursos();
        this.loadHiddenCursos();
        alert('Curso ocultado correctamente');
      },
      error: (err) => alert(err.error?.message || 'Error al ocultar curso'),
    });
  }

  // =========================
  // Recuperar curso oculto
  // =========================
  recoverCurso(id: string): void {
    this.cursosService.recoverCurso(id).subscribe({
      next: () => {
        this.loadCursos();
        this.loadHiddenCursos();
        alert('Curso recuperado correctamente');
      },
      error: (err) => alert(err.error?.message || 'Error al recuperar curso'),
    });
  }

  // =========================
  // Descargar certificado
  // =========================
  downloadCertificado(curso: Curso): void {
    if (!curso.rutacertificado || !curso._id) return;

    const ruta = curso.rutacertificado;
    const filename = ruta.split('/').pop() ?? 'certificado.pdf';

    this.cursosService.descargarCertificado(curso._id).subscribe((blob) => {
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
    this.cursoForm.reset({ activarparaqueseveaenfront: true });
    this.selectedFile = null;
    this.editingId = null;
  }
}
