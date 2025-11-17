/**
 * Main Controller
 * @description Controlador principal para manejar las operaciones básicas de la aplicación
 * @author Maya - Senior Full-Stack Developer
 * @version 1.0.0
 */

const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');
const { createError } = require('../utils/errorHandler');

/**
 * Maneja la solicitud de salud del sistema
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con estado de salud
 */
const healthCheck = async (req, res) => {
  try {
    logger.info('Health check requested');
    return res.status(200).json({
      status: 'success',
      message: 'Service is running',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Maneja la solicitud de información del sistema
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con información del sistema
 */
const systemInfo = async (req, res) => {
  try {
    // Validar que no haya errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, 'Validation failed', errors.array());
    }

    const systemData = {
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed
      },
      timestamp: new Date().toISOString()
    };

    logger.info('System info retrieved successfully');
    return res.status(200).json({
      status: 'success',
      data: systemData
    });
  } catch (error) {
    logger.error('Failed to retrieve system info', { error });
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Maneja la solicitud de error simulado para testing
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con error simulado
 */
const simulateError = async (req, res) => {
  try {
    // Simular error de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, 'Validation failed', errors.array());
    }

    // Simular error de servidor
    throw createError(500, 'Simulated server error for testing purposes');
  } catch (error) {
    logger.error('Simulated error triggered', { error });
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Maneja la solicitud de bienvenida
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} JSON con mensaje de bienvenida
 */
const welcome = async (req, res) => {
  try {
    // Validar que no haya errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, 'Validation failed', errors.array());
    }

    const welcomeMessage = {
      message: 'Welcome to the API',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      documentation: '/docs'
    };

    logger.info('Welcome message sent');
    return res.status(200).json({
      status: 'success',
      data: welcomeMessage
    });
  } catch (error) {
    logger.error('Welcome message failed', { error });
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

module.exports = {
  healthCheck,
  systemInfo,
  simulateError,
  welcome
};