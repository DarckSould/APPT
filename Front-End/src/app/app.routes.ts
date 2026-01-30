import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HomeComponent } from './components/home/home.component';
import { DatosPersonalesComponent } from './components/datos-personales/datos-personales.component';
import { ExperienciaLaboralComponent } from './components/experiencias-laborales/experiencias-laborales.component';
import { ReconocimientosComponent } from './components/reconocimientos/reconocimientos.component';
import { CursosRealizadosComponent } from './components/cursos-realizados/cursos-realizados.component';
import { ProductosAcademicosComponent } from './components/productos-academicos/productos-academicos.component';
import { ProductosLaboralesComponent } from './components/productos-laborales/productos-laborales.component';
import { VentaGarageComponent } from './components/venta-garage/venta-garage.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NavbarComponent  } from './components/navbar/navbar.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },        // Página principal
  { path: 'login', component: LoginComponent },  // Login
  { path: 'profile', component: ProfileComponent }, // Perfil
  { path: 'datos-personales', component: DatosPersonalesComponent }, // Datos Personales
  { path: 'experiencia-laboral', component: ExperienciaLaboralComponent }, // Experiencia Laboral
  { path: 'reconocimientos', component: ReconocimientosComponent }, // Reconocimientos
  { path: 'cursos-realizados', component: CursosRealizadosComponent }, // Cursos Realizados
  { path: 'productos-academicos', component: ProductosAcademicosComponent }, // Productos Académicos
  { path: 'productos-laborales', component: ProductosLaboralesComponent }, // Productos Laborales
  { path: 'venta-garage', component: VentaGarageComponent }, // Venta Garage
  { path: 'dashboard', component: DashboardComponent }, // Dashboard
  { path: 'navbar', component: NavbarComponent }, // Navbar

  { path: '**', redirectTo: '' } // cualquier ruta no encontrada redirige a home
];
