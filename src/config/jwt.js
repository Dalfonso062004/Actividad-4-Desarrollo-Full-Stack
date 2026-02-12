const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Verificar que JWT_SECRET existe
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está definido');
    // Valor por defecto para desarrollo/pruebas
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key';
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key';
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };