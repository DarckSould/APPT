import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatosPersonalesService } from '../../services/datos-personales.service';
import { DatosPersonales } from '../../models/datos-personales.model';

@Component({
  selector: 'app-datos-personales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './datos-personales.component.html',
  styleUrls: ['./datos-personales.component.css'],
})
export class DatosPersonalesComponent implements OnInit {
  form: FormGroup;
  loading = false;

  fotoSeleccionada?: File;
  fotoPreview?: string;

  // ruta relativa y URL completa separadas
  fotoActual?: string; // ruta relativa (para backend)
  fotoUrl?: string;    // URL completa (para mostrar)

  constructor(
    private fb: FormBuilder,
    private datosService: DatosPersonalesService
  ) {
    this.form = this.fb.group({
      idperfil: [null],
      descripcionperfil: [''],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      nacionalidad: [''],
      lugarnacimiento: [''],
      fechanacimiento: ['', Validators.required],
      numerocedula: ['', Validators.required],
      sexo: ['', Validators.required],
      estadocivil: [''],
      licenciaconducir: [''],
      telefonoconvencional: [''],
      telefonofijo: [''],
      direcciontrabajo: [''],
      direcciondomiciliaria: [''],
      sitioweb: [''],
    });
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // Construir URL completa de la foto
 getFotoUrl(foto?: string): string {
  return foto ? `http://localhost:4000${foto}` : '';
}

  // ========================= PERFIL =========================
  cargarPerfil(): void {
    this.loading = true;
    this.datosService.getPerfil().subscribe({
      next: (perfil: DatosPersonales) => {
        if (perfil) {
          this.form.patchValue(perfil);

          if (perfil.foto) {
            this.fotoActual = perfil.foto;          // ruta relativa
            this.fotoUrl = this.getFotoUrl(perfil.foto); // URL completa
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('No se pudo cargar el perfil');
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    const data: DatosPersonales = { ...this.form.value };

    // Mantener foto actual si no se seleccionó nueva
    if (!this.fotoSeleccionada && this.fotoActual) {
      data.foto = this.fotoActual; // ruta relativa
    }

    if (data.fechanacimiento) {
      data.fechanacimiento = new Date(data.fechanacimiento).toISOString();
    }

    this.loading = true;
    this.datosService.guardarPerfil(data).subscribe({
      next: (res: DatosPersonales) => {
        this.loading = false;
        alert('Datos guardados correctamente');

        if (!this.form.value.idperfil && res.idperfil) {
          this.form.patchValue({ idperfil: res.idperfil });
        }

        // Actualizar foto si viene del backend
        if (res.foto) {
          this.fotoActual = res.foto;          // ruta relativa
          this.fotoUrl = this.getFotoUrl(res.foto); // URL completa
          this.fotoPreview = undefined;
          this.fotoSeleccionada = undefined;
        }
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Error al guardar');
      },
    });
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fotoSeleccionada = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
      };
      reader.readAsDataURL(this.fotoSeleccionada);
    }
  }

  subirFoto(): void {
    if (!this.fotoSeleccionada) {
      alert('Selecciona una foto primero');
      return;
    }

    this.loading = true;
    this.datosService.subirFoto(this.fotoSeleccionada).subscribe({
      next: (res) => {
        this.loading = false;
        this.fotoActual = res.perfil.foto;          // ruta relativa
        this.fotoUrl = this.getFotoUrl(res.perfil.foto); // URL completa
        this.fotoPreview = undefined;
        this.fotoSeleccionada = undefined;
        alert('Foto actualizada correctamente');
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Error al subir la foto');
      },
    });
  }

  eliminarPerfil(): void {
    if (!confirm('⚠️ Esto ocultará TODO el perfil. ¿Continuar?')) return;

    this.loading = true;
    this.datosService.eliminarPerfil().subscribe({
      next: () => {
        this.loading = false;
        this.form.reset();
        this.fotoActual = undefined;
        this.fotoUrl = undefined;
        this.fotoPreview = undefined;
        alert('Perfil ocultado correctamente');
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || err.message);
      },
    });
  }

  recuperarPerfil(): void {
    if (!confirm('⚠️ Esto recuperará el perfil oculto. ¿Continuar?')) return;

    this.loading = true;
    this.datosService.recuperarPerfil().subscribe({
      next: (res) => {
        this.loading = false;
        this.form.patchValue(res.perfil);
        if (res.perfil.foto) {
          this.fotoActual = res.perfil.foto;          // ruta relativa
          this.fotoUrl = this.getFotoUrl(res.perfil.foto); // URL completa
          this.fotoPreview = undefined;
        }
        alert(res.message || 'Perfil recuperado correctamente');
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || err.message);
      },
    });
  }

  cargarPerfilOculto(): void {
    this.loading = true;
    this.datosService.getPerfilOculto().subscribe({
      next: (perfil) => {
        this.loading = false;
        this.form.patchValue(perfil);
        if (perfil.foto) {
          this.fotoActual = perfil.foto;          // ruta relativa
          this.fotoUrl = this.getFotoUrl(perfil.foto); // URL completa
          this.fotoPreview = undefined;
        }
        alert('Perfil oculto cargado');
      },
      error: () => {
        this.loading = false;
        alert('No hay perfil oculto');
      },
    });
  }
}
