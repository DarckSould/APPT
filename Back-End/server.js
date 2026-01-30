require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./src/config/db');

// Rutas
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const datosPersonalesRoutes = require('./src/routes/datosPersonalesRoutes');
const experienciaLaboralRoutes = require('./src/routes/experienciaLaboralRoutes');
const reconocimientosRoutes = require('./src/routes/reconocimientosRoutes');
const cursosRealizadosRoutes = require('./src/routes/cursosRealizadosRoutes');
const productosAcademicosRoutes = require('./src/routes/productosAcademicosRoutes');
const productosLaboralesRoutes = require('./src/routes/productosLaboralesRoutes');
const ventaGarageRoutes = require('./src/routes/ventaGarageRoutes');

// Middleware de errores
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

/* ======================
   Middlewares globales
====================== */
app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Servir archivos estáticos (certificados)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ===== Rutas ===== */
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/datos-personales', datosPersonalesRoutes);
app.use('/api/experiencia-laboral', experienciaLaboralRoutes);
app.use('/api/reconocimientos', reconocimientosRoutes);
app.use('/api/cursos-realizados', cursosRealizadosRoutes);
app.use('/api/productos-academicos', productosAcademicosRoutes);
app.use('/api/productos-laborales', productosLaboralesRoutes);
app.use('/api/venta-garage', ventaGarageRoutes);

/* ======================
   Middleware de errores
====================== */
app.use(errorHandler);

/* ======================
   Server
====================== */
const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  });
