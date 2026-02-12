const { verifyToken } = require('../config/jwt');
const User = require('../models/User');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No autorizado - Token no proporcionado', 401));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('Usuario no encontrado', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('No autorizado - Token inválido', 401));
  }
};

module.exports = { protect };