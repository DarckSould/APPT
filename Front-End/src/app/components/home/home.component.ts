// ========================= IMPORTACIONES =========================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatosPersonalesService } from '../../services/datos-personales.service';
import { DatosPersonales } from '../../models/datos-personales.model';
import { ExperienciaService } from '../../services/experiencia-laboral.service';
import { CursosService } from '../../services/cursos-realizados.service';
import { ReconocimientosService } from '../../services/reconocimiento.service';
import { ProductosAcademicosService } from '../../services/productos-academicos.service';
import { Experiencia } from '../../models/experiencia-laboral.model';
import { Curso } from '../../models/cursos-realizados.model';
import { Reconocimiento } from '../../models/reconocimiento.model';
import { ProductosLaboralesService } from '../../services/productos-laborales.service';
import { VentaGarageService } from '../../services/venta-garage.service';
import { FormsModule } from '@angular/forms';

// Modelos
import { ProductoLaboral } from '../../models/productos-laborales.model';
import { ProductoAcademico } from '../../models/productos-academicos.model';
import { VentaGarage } from '../../models/venta-garage.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  perfil: DatosPersonales | null = null;
  experiencias: Experiencia[] = [];
  cursos: Curso[] = [];
  reconocimientos: Reconocimiento[] = [];
  productos: ProductoAcademico[] = [];
  productosLaborales: ProductoLaboral[] = [];
  ventasGarage: VentaGarage[] = [];

  loadingPerfil = false;
  loadingExperiencias = false;
  loadingCursos = false;
  loadingReconocimientos = false;
  loadingProductos = false;
  loadingProductosLaborales = false;
  loadingVentasGarage = false;
  menuAbierto: boolean = false;
  fotoPreview?: string;

  // ---------------------- IMPRESIÓN ----------------------
  seccionesParaImprimir = {
    perfil: true,
    experiencias: true,
    reconocimientos: true,
    cursos: true,
    productosAcademicos: true,
    productosLaborales: true,
    ventasGarage: true
  };

  constructor(
    private datosService: DatosPersonalesService,
    private experienciaService: ExperienciaService,
    private cursosService: CursosService,
    private recService: ReconocimientosService,
    private productosService: ProductosAcademicosService,
    private productosLaboralesService: ProductosLaboralesService,
    private ventasGarageService: VentaGarageService
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarExperiencias();
    this.cargarCursos();
    this.cargarReconocimientos();
    this.cargarProductos();
    this.cargarProductosLaborales();
    this.cargarVentasGarage();
  }

  // ========================= PERFIL =========================
cargarPerfil(): void {
  this.loadingPerfil = true;
  this.datosService.getPerfil().subscribe({
    next: perfil => {
      this.perfil = perfil;
      if (perfil.foto) {
        // Generar URL completa para mostrar
        this.fotoPreview = this.getFotoUrl(perfil.foto);
      }
      this.loadingPerfil = false;
    },
    error: err => {
      console.error(err);
      this.loadingPerfil = false;
      alert('No se pudo cargar el perfil activo');
    }
  });
}


  // ========================= EXPERIENCIAS =========================
  cargarExperiencias(): void {
    this.loadingExperiencias = true;
    this.experienciaService.getExperiencias().subscribe({
      next: res => {
        this.experiencias = res;
        this.loadingExperiencias = false;
      },
      error: err => {
        console.error(err);
        this.loadingExperiencias = false;
        alert('No se pudieron cargar las experiencias laborales');
      }
    });
  }

  downloadCertificadoExperiencia(exp: Experiencia): void {
    if (!exp.rutacertificado || !exp._id) return;
    const filename = exp.rutacertificado.split('/').pop() ?? 'certificado.pdf';
    this.experienciaService.descargarCertificado(exp._id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // ========================= CURSOS =========================
  cargarCursos(): void {
    this.loadingCursos = true;
    this.cursosService.getCursos().subscribe({
      next: res => {
        this.cursos = res;
        this.loadingCursos = false;
      },
      error: err => {
        console.error(err);
        this.loadingCursos = false;
        alert('No se pudieron cargar los cursos realizados');
      }
    });
  }

  downloadCertificadoCurso(curso: Curso): void {
    if (!curso.rutacertificado || !curso._id) return;
    const filename = curso.rutacertificado.split('/').pop() ?? 'certificado.pdf';
    this.cursosService.descargarCertificado(curso._id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // ========================= RECONOCIMIENTOS =========================
  cargarReconocimientos(): void {
    this.loadingReconocimientos = true;
    this.recService.getReconocimientos().subscribe({
      next: res => {
        this.reconocimientos = res;
        this.loadingReconocimientos = false;
      },
      error: err => {
        console.error(err);
        this.loadingReconocimientos = false;
        alert('No se pudieron cargar los reconocimientos');
      }
    });
  }

  downloadCertificadoReconocimiento(rec: Reconocimiento): void {
    if (!rec.rutacertificado || !rec._id) return;
    const filename = rec.rutacertificado.split('/').pop() ?? 'certificado.pdf';
    this.recService.descargarCertificado(rec._id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // ========================= PRODUCTOS ACADÉMICOS =========================
  cargarProductos(): void {
    this.loadingProductos = true;
    this.productosService.getProductos().subscribe({
      next: res => {
        this.productos = res;
        this.loadingProductos = false;
      },
      error: err => {
        console.error(err);
        this.loadingProductos = false;
        alert('No se pudieron cargar los productos académicos');
      }
    });
  }
  
  // ========================= PRODUCTOS LABORALES =========================
  cargarProductosLaborales(): void {
    this.loadingProductosLaborales = true;
    this.productosLaboralesService.getProductos().subscribe({
      next: res => {
        this.productosLaborales = res;
        this.loadingProductosLaborales = false;
      },
      error: err => {
        console.error(err);
        this.loadingProductosLaborales = false;
        alert('No se pudieron cargar los productos laborales');
      }
    });
  }

  // ========================= VENTAS GARAGE =========================
  cargarVentasGarage(): void {
    this.loadingVentasGarage = true;
    this.ventasGarageService.getProductos().subscribe({
      next: res => {
        this.ventasGarage = res;
        this.loadingVentasGarage = false;
      },
      error: err => {
        console.error(err);
        this.loadingVentasGarage = false;
        alert('No se pudieron cargar las ventas de garage');
      }
    });
  }

getFotoUrl(foto?: string): string {
  return foto ? `https://appt-z1np.onrender.com${foto}` : '';
}


  // ========================= IMPRESIÓN =========================
imprimir(): void {
  const printContent = document.createElement('div');

  const seccionesMap = {
    perfil: 'perfil',
    experiencias: 'experiencias',
    reconocimientos: 'reconocimientos',
    cursos: 'cursos',
    productosAcademicos: 'productos-academicos',
    productosLaborales: 'productos-laborales',
    ventasGarage: 'ventas-garage'
  };

  // Clonar solo las secciones seleccionadas
  for (const key in this.seccionesParaImprimir) {
    if (this.seccionesParaImprimir[key as keyof typeof this.seccionesParaImprimir]) {
      const el = document.getElementById(seccionesMap[key as keyof typeof seccionesMap]);
      if (el) printContent.appendChild(el.cloneNode(true));
    }
  }

  const printWindow = window.open('', '', 'width=1000,height=800');
  if (!printWindow) return;

  // Copiar todas las hojas de estilo del documento actual
  let styles = '';
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      if (sheet.cssRules) {
        Array.from(sheet.cssRules).forEach(rule => {
          styles += rule.cssText;
        });
      }
    } catch (e) {
      console.warn('No se pudo acceder a CSS externo', e);
    }
  });

  printWindow.document.write(`
    <html>
      <head>
        <title>Imprimir CV</title>
        <style>
          ${styles}

          /* Ocultar elementos innecesarios en impresión */
          @media print {
            button, input, .no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; }
            .section { page-break-inside: avoid; margin-bottom: 20px; }
          }

          body {
            font-family: Arial, sans-serif;
            background-color: #f9fafb;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Espera un pequeño tiempo para que cargue CSS antes de imprimir
  setTimeout(() => {
    printWindow?.print();
    printWindow?.close();
  }, 500);
}

}
