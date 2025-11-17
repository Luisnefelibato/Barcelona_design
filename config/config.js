/**
 * Configuración centralizada de la aplicación
 * @module config
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Clase que maneja la configuración centralizada de la aplicación
 * @class ConfigManager
 */
class ConfigManager {
  /**
   * Crea una instancia de ConfigManager
   * @constructor
   */
  constructor() {
    this.config = {};
    this.isLoaded = false;
  }

  /**
   * Carga la configuración desde archivos de entorno
   * @async
   * @returns {Promise<void>}
   */
  async loadConfig() {
    try {
      // Carga variables de entorno desde .env
      await this.loadEnvConfig();
      
      // Carga configuración específica del entorno
      await this.loadEnvironmentConfig();
      
      // Valida la configuración cargada
      this.validateConfig();
      
      this.isLoaded = true;
      console.log('Configuración cargada exitosamente');
    } catch (error) {
      console.error('Error al cargar la configuración:', error);
      throw new Error(`Error de configuración: ${error.message}`);
    }
  }

  /**
   * Carga variables de entorno desde archivo .env
   * @async
   * @private
   * @returns {Promise<void>}
   */
  async loadEnvConfig() {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      
      const envVars = envContent
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .reduce((acc, line) => {
          const [key, value] = line.split('=');
          acc[key.trim()] = value ? value.trim().replace(/['"]/g, '') : '';
          return acc;
        }, {});
      
      Object.assign(process.env, envVars);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw new Error(`Error al leer el archivo .env: ${error.message}`);
      }
      // Si no existe el archivo .env, continuamos con las variables de entorno
      console.warn('Archivo .env no encontrado, usando variables de entorno directas');
    }
  }

  /**
   * Carga configuración específica del entorno
   * @async
   * @private
   * @returns {Promise<void>}
   */
  async loadEnvironmentConfig() {
    const environment = process.env.NODE_ENV || 'development';
    const configPath = path.resolve(process.cwd(), `config/${environment}.json`);
    
    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      const environmentConfig = JSON.parse(configContent);
      
      this.config = {
        ...this.config,
        ...environmentConfig,
        environment
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`Archivo de configuración para ${environment} no encontrado`);
        this.config.environment = environment;
      } else {
        throw new Error(`Error al cargar configuración de entorno: ${error.message}`);
      }
    }
  }

  /**
   * Valida que la configuración esté completa y sea válida
   * @private
   * @returns {void}
   * @throws {Error} Si falta alguna configuración requerida
   */
  validateConfig() {
    const required = [
      'port',
      'databaseUrl',
      'jwtSecret'
    ];

    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Configuración incompleta. Faltan: ${missing.join(', ')}`);
    }

    // Validaciones específicas
    if (this.config.port && (this.config.port < 1 || this.config.port > 65535)) {
      throw new Error('Puerto inválido. Debe estar entre 1 y 65535');
    }

    if (!this.config.databaseUrl.startsWith('mongodb://') && 
        !this.config.databaseUrl.startsWith('postgres://')) {
      throw new Error('URL de base de datos inválida. Debe ser MongoDB o PostgreSQL');
    }

    if (this.config.jwtExpiration && isNaN(this.config.jwtExpiration)) {
      throw new Error('jwtExpiration debe ser un número válido');
    }
  }

  /**
   * Obtiene una configuración específica
   * @param {string} key - La clave de configuración
   * @param {*} defaultValue - Valor por defecto si no existe
   * @returns {*} El valor de configuración o el valor por defecto
   */
  get(key, defaultValue = null) {
    if (!this.isLoaded) {
      throw new Error('La configuración no ha sido cargada aún');
    }
    
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * Obtiene toda la configuración cargada
   * @returns {Object} Objeto con toda la configuración
   */
  getAll() {
    if (!this.isLoaded) {
      throw new Error('La configuración no ha sido cargada aún');
    }
    
    return { ...this.config };
  }

  /**
   * Obtiene configuración de base de datos
   * @returns {Object} Configuración de base de datos
   */
  getDatabaseConfig() {
    return {
      url: this.get('databaseUrl'),
      options: this.get('databaseOptions', {})
    };
  }

  /**
   * Obtiene configuración de seguridad
   * @returns {Object} Configuración de seguridad
   */
  getSecurityConfig() {
    return {
      jwtSecret: this.get('jwtSecret'),
      jwtExpiration: this.get('jwtExpiration', '24h'),
      sessionSecret: this.get('sessionSecret', 'default-session-secret')
    };
  }

  /**
   * Obtiene configuración de servidor
   * @returns {Object} Configuración del servidor
   */
  getServerConfig() {
    return {
      port: this.get('port', 3000),
      host: this.get('host', 'localhost'),
      sslEnabled: this.get('sslEnabled', false)
    };
  }
}

// Exporta una instancia única de ConfigManager
const configManager = new ConfigManager();

// Carga la configuración automáticamente al importar
configManager.loadConfig().catch(error => {
  console.error('No se pudo cargar la configuración:', error);
  process.exit(1);
});

module.exports = configManager;