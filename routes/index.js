const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Endpoint de salud para verificar disponibilidad del servicio
 *     description: Retorna un mensaje de estado para confirmar que el servicio está operativo
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio operativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Service is running"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/api', (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      message: 'Service is running'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     description: Permite crear un nuevo usuario con validación de datos
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 name:
 *                   type: string
 *                   example: "Juan Pérez"
 *                 email:
 *                   type: string
 *                   example: "juan@example.com"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/api/users',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Simulación de creación de usuario en base de datos
      // En producción se usaría un modelo real
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        createdAt: new Date()
      };

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create user',
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Endpoint protegido que requiere autenticación
 *     description: Acceso restringido a usuarios autenticados
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso permitido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access granted"
 *       401:
 *         description: Acceso no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/api/protected', authenticateToken, (req, res) => {
  try {
    res.status(200).json({
      message: 'Access granted',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;