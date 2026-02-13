// src/config/database.js - VERSIÓN CORREGIDA
const mongoose = require('mongoose');

// Variable global para cachear la conexión
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
    console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@')); // Oculta la contraseña
    
    // ✅ OPCIONES ACTUALIZADAS (sin useNewUrlParser ni useUnifiedTopology)
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 30000, // Aumentar timeout
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Error detallado de conexión MongoDB:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw error;
  }
};

const checkConnection = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, checkConnection };