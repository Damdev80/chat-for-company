// controllers/user.controller.js
import { ModelsUser } from '../models/user.js'
import { userSchema } from '../validations/user.validation.js'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import jwt from 'jsonwebtoken'
import { ModelsRole } from '../models/role.js' // Asegúrate de importar el modelo de rol
import { EmailService } from '../services/emailService.js'
import { config } from '../config/config.js'
import crypto from 'crypto'

export class UserController {  static async register(req, res) {
    try {
      
      // Validar datos con Zod
      const result = userSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }
  
      const { username, email, password } = result.data // 👈🏻 Ya NO pedimos role_id
  
      // Verificar si el usuario ya existe
      const existingUser = await ModelsUser.getByUsername(username)
      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' })
      }
  
      // Verificar si el email ya existe
      const existingEmail = await ModelsUser.getByEmail(email)
      if (existingEmail) {
        return res.status(400).json({ message: 'El email ya está en uso' })
      }      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10)
  
      // Buscar o crear el rol por defecto ("user")
      let userRole = await ModelsRole.getByName('user');
      
      if (!userRole) {
        // Para SQLite/Turso, usamos hex(randomblob(16))
        const createRoleQuery = 'INSERT INTO roles (id, name, description) VALUES (lower(hex(randomblob(16))), ?, ?)';
          
        const connection = await getConnection();
        const [result] = await connection.execute(
          createRoleQuery,
          ['user', 'Usuario estándar']
        );
        connection.end();
        
        // Obtener el rol creado
        userRole = await ModelsRole.getByName('user');
      }

      if (!userRole || !userRole.id) {
        throw new Error('No se pudo obtener o crear el rol de usuario');
      }
      
      // Crear el usuario con el ID del rol encontrado o creado
      try {
        await ModelsUser.create({
          username,
          email,
          password: hashedPassword,
          role_id: userRole.id
        });
        
        res.status(201).json({ message: 'Usuario registrado correctamente' });
      } catch (dbError) {
        console.error('Error específico al insertar usuario en la base de datos:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
  }  static async login(req, res) {
    try {
      const { username, password } = req.body

      // Verificar si existe el usuario (puede ser username o email)
      let user = await ModelsUser.getByUsername(username)
      
      // Si no se encuentra por username, intentar buscar por email
      if (!user) {
        user = await ModelsUser.getByEmail(username)
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Credenciales incorrectas' })
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password)
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciales incorrectas' })
      }

      // Obtener el nombre del rol
      const roleRow = await ModelsRole.getById(user.role_id);
      const role = roleRow ? roleRow.name : undefined;

      // Generar JWT
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role_id: user.role_id,
          role // Incluimos el nombre del rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      res.status(200).json({
        message: 'Login exitoso',
        token, // ← Aquí va el token
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role_id: user.role_id,
          role // Incluir el nombre del rol en la respuesta
        }
      })
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
  static async getAll(req, res) {
    try {
      const users = await ModelsUser.getAll()
      res.json({ users })
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const user = await ModelsUser.getById(id)
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }
      
      res.json(user)
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  // Crear nuevo administrador (solo admins pueden llamar este método)
  static async createAdmin(req, res) {
    try {
      const { username, email, password } = req.body
      // Validar con Zod
      const result = userSchema.safeParse({ username, email, password })
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }
      // Verificar que no exista usuario o email
      if (await ModelsUser.getByUsername(username)) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' })
      }
      if (await ModelsUser.getByEmail(email)) {
        return res.status(400).json({ message: 'El email ya está en uso' })
      }
      // Obtener role_id de admin
      const adminRole = await ModelsRole.getByName('admin')
      if (!adminRole) {
        return res.status(500).json({ message: 'Rol admin no configurado' })
      }      const hashedPassword = await bcrypt.hash(password, 10)
      await ModelsUser.create({
        username,
        email,
        password: hashedPassword,
        role_id: adminRole.id
      })
      
      res.status(201).json({ message: 'Administrador creado correctamente' })
    } catch (error) {
      console.error('Error al crear administrador:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  // Función para solicitar recuperación de contraseña
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'El email es requerido' 
        })
      }


      // Buscar usuario por email
      const user = await ModelsUser.getByEmail(email)
      if (!user) {
        // Por seguridad, siempre devolvemos éxito aunque el email no exista
        return res.status(200).json({ 
          success: true, 
          message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' 
        })
      }


      // Generar token de recuperación
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora


      // Guardar token en la base de datos
      await ModelsUser.setPasswordResetToken(user.id, resetToken, resetTokenExpiry)


      // Enviar email de recuperación
      await EmailService.sendPasswordResetEmail(email, resetToken, user.username)


      res.status(200).json({ 
        success: true, 
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' 
      })
    } catch (error) {
      console.error('❌ Error en requestPasswordReset:', error)
      console.error('Stack:', error.stack)
      console.error('Mensaje:', error.message)
      
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        ...(config.NODE_ENV === 'development' && { error: error.message, stack: error.stack })
      })
    }
  }

  // Función para validar token de recuperación
  static async validateResetToken(req, res) {
    try {
      const { token } = req.params

      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token requerido' 
        })
      }

      // Buscar usuario por token válido
      const user = await ModelsUser.getByResetToken(token)
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token inválido o expirado' 
        })
      }

      res.status(200).json({ 
        success: true, 
        message: 'Token válido',
        data: {
          username: user.username,
          email: user.email
        }
      })
    } catch (error) {
      console.error('Error en validateResetToken:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      })
    }
  }

  // Función para restablecer contraseña
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body

      if (!token || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token y nueva contraseña son requeridos' 
        })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'La contraseña debe tener al menos 6 caracteres' 
        })
      }

      // Buscar usuario por token válido
      const user = await ModelsUser.getByResetToken(token)
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token inválido o expirado' 
        })
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Actualizar contraseña y limpiar token
      await ModelsUser.updatePassword(user.id, hashedPassword)
      await ModelsUser.clearPasswordResetToken(user.id)

      // Enviar email de confirmación
      await EmailService.sendPasswordChangeConfirmation(user.email, user.username)

      res.status(200).json({ 
        success: true, 
        message: 'Contraseña actualizada correctamente' 
      })
    } catch (error) {
      console.error('Error en resetPassword:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      })
    }
  }
}