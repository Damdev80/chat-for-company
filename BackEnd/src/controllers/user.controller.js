// controllers/user.controller.js
import { ModelsUser } from '../models/user.js'
import { userSchema } from '../validations/user.validation.js'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import jwt from 'jsonwebtoken'
import { ModelsRole } from '../models/role.js' // Asegúrate de importar el modelo de rol

export class UserController {  static async register(req, res) {
    try {
      console.log('Recibida solicitud de registro:', req.body);
      
      // Validar datos con Zod
      const result = userSchema.safeParse(req.body)
      if (!result.success) {
        console.log('Error de validación:', result.error.issues);
        return res.status(400).json({ errors: result.error.issues })
      }
  
      const { username, email, password } = result.data // 👈🏻 Ya NO pedimos role_id
      console.log('Datos validados correctamente');
  
      // Verificar si el usuario ya existe
      const existingUser = await ModelsUser.getByUsername(username)
      if (existingUser) {
        console.log('Usuario ya existe:', username);
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' })
      }
  
      // Verificar si el email ya existe
      const existingEmail = await ModelsUser.getByEmail(email)
      if (existingEmail) {
        console.log('Email ya existe:', email);
        return res.status(400).json({ message: 'El email ya está en uso' })
      }      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10)
  
      // Buscar o crear el rol por defecto ("user")
      console.log('Buscando rol "user" en la base de datos');
      let userRole = await ModelsRole.getByName('user');
      
      if (!userRole) {
        console.log('Rol "user" no encontrado, creándolo');
        // Crear el rol "user" si no existe
        // Para SQLite/Turso, adaptamos la función UUID
        const createRoleQuery = process.env.NODE_ENV === 'production' 
          ? 'INSERT INTO roles (id, name, description) VALUES (lower(hex(randomblob(16))), ?, ?)'
          : 'INSERT INTO roles (id, name, description) VALUES (UUID(), ?, ?)';
          
        const connection = await getConnection();
        const [result] = await connection.execute(
          createRoleQuery,
          ['user', 'Usuario estándar']
        );
        connection.end();
        
        // Obtener el rol creado
        userRole = await ModelsRole.getByName('user');
        console.log('Rol "user" creado con ID:', userRole?.id);
      } else {
        console.log('Rol "user" encontrado con ID:', userRole.id);
      }
      
      if (!userRole || !userRole.id) {
        throw new Error('No se pudo obtener o crear el rol de usuario');
      }
      
      // Crear el usuario con el ID del rol encontrado o creado
      console.log('Creando usuario con role_id:', userRole.id);
      try {
        await ModelsUser.create({
          username,
          email,
          password: hashedPassword,
          role_id: userRole.id
        });
        console.log('Usuario creado correctamente');
        
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
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body

      // Verificar si existe el usuario
      const user = await ModelsUser.getByUsername(username)
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
      }
      const hashedPassword = await bcrypt.hash(password, 10)
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
}