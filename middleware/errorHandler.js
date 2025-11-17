/**
 * Middleware para manejo centralizado de errores en la aplicación
 * @module errorHandler
 */

/**
 * Clase para manejo de errores personalizados
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
  /**
   * Crea un error personalizado
   * @param {string} message - Mensaje del error
   * @param {number} statusCode - Código de estado HTTP
   * @param {boolean} isOperational - Indica si el error es operacional
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejo de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Siguiente middleware
 * @returns {Object} Respuesta con error
 */
const errorHandler = (err, req, res, next) => {
  // Establecer valores por defecto para el error
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  let error = { ...err };

  // Copiar las propiedades del error original
  error.message = err.message;
  error.statusCode = err.statusCode;

  // Manejo de errores específicos según el tipo de error
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Manejo de errores de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Log del error (en producción podría usarse un logger como winston)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Respuesta de error
  return res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : {}
  });
};

/**
 * Middleware para manejar errores asíncronos no capturados
 * @param {Function} fn - Función asíncrona
 * @returns {Function} Middleware para manejo de errores
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  AppError,
  errorHandler,
  asyncHandler
};