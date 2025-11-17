const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger, errorLogger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { validateRequest } = require('./middleware/validation');
const routes = require('./routes');

/**
 * Clase principal del servidor Express
 * @class Server
 */
class Server {
  /**
   * Constructor del servidor
   * @constructor
   */
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Inicializa los middlewares principales
   * @private
   */
  initializeMiddleware() {
    // Seguridad
    this.app.use(helmet());
    this.app.use(cors());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // limita a 100 solicitudes por IP
      message: 'Demasiadas solicitudes desde esta IP'
    });
    this.app.use(limiter);

    // Parseo de JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    this.app.use(logger);
  }

  /**
   * Configura las rutas de la aplicación
   * @private
   */
  initializeRoutes() {
    // Rutas principales
    this.app.use('/api', routes);

    // Ruta de salud
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Ruta 404 para rutas no definidas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
      });
    });
  }

  /**
   * Configura el manejo de errores
   * @private
   */
  initializeErrorHandling() {
    // Logging de errores
    this.app.use(errorLogger);

    // Manejo de errores centralizado
    this.app.use(errorHandler);
  }

  /**
   * Inicia el servidor
   * @returns {Promise<void>}
   */
  async start() {
    try {
      const server = this.app.listen(this.port, () => {
        console.log(`Servidor corriendo en el puerto ${this.port}`);
      });

      // Manejo de señales de proceso
      process.on('SIGTERM', () => {
        console.log('SIGTERM recibido, cerrando servidor...');
        server.close(() => {
          console.log('Servidor cerrado');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        console.log('SIGINT recibido, cerrando servidor...');
        server.close(() => {
          console.log('Servidor cerrado');
          process.exit(0);
        });
      });

    } catch (error) {
      console.error('Error al iniciar el servidor:', error);
      process.exit(1);
    }
  }
}

// Exporta la instancia del servidor
module.exports = new Server();