const { body, validationResult } = require('express-validator');

/**
 * Middleware de validación para requests HTTP
 * @description Valida los campos de request según las reglas definidas
 * @param {Array} validations - Array de validaciones express-validator
 * @returns {Function} Middleware de validación
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Ejecutar todas las validaciones definidas
      await Promise.all(validations.map(validation => validation.run(req)));

      // Recoger errores de validación
      const errors = validationResult(req);
      
      // Si hay errores, responder con 422 Unprocessable Entity
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Si no hay errores, continuar con el siguiente middleware
      next();
    } catch (error) {
      // Manejo de errores inesperados en la validación
      next(error);
    }
  };
};

/**
 * Validación de campos de usuario
 * @description Validaciones para datos de usuario como email, password, etc.
 */
const userValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters long')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces')
  ];
};

/**
 * Validación de campos de login
 * @description Validaciones para datos de inicio de sesión
 */
const loginValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];
};

/**
 * Validación de campos de producto
 * @description Validaciones para datos de producto
 */
const productValidationRules = () => {
  return [
    body('name')
      .isLength({ min: 3, max: 100 })
      .withMessage('Product name must be between 3 and 100 characters long'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters long'),
    body('category')
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be between 1 and 50 characters long')
  ];
};

/**
 * Validación de ID de entidad
 * @description Validación para IDs de entidades (UUID o números)
 */
const idValidationRules = () => {
  return [
    body('id')
      .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
      .withMessage('Invalid ID format (UUID required)')
  ];
};

module.exports = {
  validate,
  userValidationRules,
  loginValidationRules,
  productValidationRules,
  idValidationRules
};