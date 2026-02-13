// server.js
const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const { connectDB, checkConnection } = require('./src/config/database');

// Variable para el servidor HTTP (solo para desarrollo local)
let server;

// Función principal para Vercel
const startServer = async () => {
  try {
    console.log('Iniciando servidor...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI existe:', !!process.env.MONGODB_URI);
    
    // Conectar a MongoDB (esto es asíncrono)
    await connectDB();
    console.log('Conexión a MongoDB establecida');
    
    return app;
  } catch (error) {
    console.error('Error fatal al iniciar:', error);
    throw error;
  }
};

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  
  startServer()
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
      });
    })
    .catch(err => {
      console.error('No se pudo iniciar el servidor:', err);
      process.exit(1);
    });
}

// Middleware de conexión para Vercel
app.use(async (req, res, next) => {
  try {
    if (!checkConnection()) {
      console.log('Reconectando a MongoDB...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Error de conexión en middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Error de conexión a la base de datos'
    });
  }
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
});

// Exportar para Vercel
module.exports = app;