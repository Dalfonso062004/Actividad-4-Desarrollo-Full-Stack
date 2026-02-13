// src/config/database.js - VERSIÓN CORREGIDA PARA VERCEL
const mongoose = require('mongoose');

// Variable global para cachear la conexión (importante para serverless)
let cachedConnection = null;

const connectDB = async () => {
  // Si ya tenemos una conexión activa, la reutilizamos
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Usando conexión cacheada a MongoDB');
    return cachedConnection;
  }

  try {
    // Verificar que MONGODB_URI existe
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    console.log('Conectando a MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Configuración importante para serverless
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error detallado de conexión MongoDB:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    // En Vercel, no queremos que el proceso termine
    // Solo lanzamos el error para manejarlo arriba
    throw error;
  }
};

// Función para verificar la conexión
const checkConnection = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, checkConnection };