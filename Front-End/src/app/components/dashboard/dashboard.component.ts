import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes Standalone
import { DatosPersonalesComponent } from '../datos-personales/datos-personales.component';
import { ProfileComponent } from '../profile/profile.component';
import { ProductosAcademicosComponent } from '../productos-academicos/productos-academicos.component';
import { ProductosLaboralesComponent } from '../productos-laborales/productos-laborales.component';
import { VentaGarageComponent } from '../venta-garage/venta-garage.component';
import { CursosRealizadosComponent } from '../cursos-realizados/cursos-realizados.component';
import { ExperienciaLaboralComponent } from '../experiencias-laborales/experiencias-laborales.component';
import { ReconocimientosComponent } from '../reconocimientos/reconocimientos.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DatosPersonalesComponent,
    ProfileComponent,
    ProductosAcademicosComponent,
    ProductosLaboralesComponent,
    VentaGarageComponent,
    CursosRealizadosComponent,
    ExperienciaLaboralComponent,
    ReconocimientosComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  // Sección activa
  activeSection: string = 'datos-personales';

  // Pestañas del navbar
  tabs = [
    { id: 'datos-personales', label: 'Datos Personales' },
    { id: 'productos-academicos', label: 'Productos Académicos' },
    { id: 'experiencia-laboral', label: 'Experiencia Laboral' },
    { id: 'productos-laborales', label: 'Productos Laborales' },
    { id: 'venta-garage', label: 'Venta de Garage' },
    { id: 'cursos-realizados', label: 'Cursos Realizados' },
    { id: 'reconocimientos', label: 'Reconocimientos' }
  ];

  // Cambiar sección activa
  showSection(section: string) {
    this.activeSection = section;
  }
}
