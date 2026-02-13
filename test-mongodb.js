// test-mongodb.js
const mongoose = require('mongoose');
require('dotenv').config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error de conexión:', {
      message: err.message,
      code: err.code,
      name: err.name
    });
    process.exit(1);
  });