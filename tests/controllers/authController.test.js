const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth Controller', () => {
  // Limpiar antes de cada prueba
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@test.com');
    });

    it('debería fallar con email duplicado', async () => {
      // Crear usuario primero
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: '123456'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@test.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('El email ya está registrado');
    });

    it('debería validar campos requeridos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com'
          // Falta name y password
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario para pruebas de login
      await User.create({
        name: 'Login User',
        email: 'login@test.com',
        password: '123456'
      });
    });

    it('debería hacer login con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('debería fallar con contraseña incorrecta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Credenciales inválidas');
    });

    it('debería fallar con email no registrado', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Profile User',
        email: 'profile@test.com',
        password: '123456'
      });
      userId = user._id;

      const jwt = require('jsonwebtoken');
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    });

    it('debería obtener el perfil del usuario con token válido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('profile@test.com');
    });

    it('debería fallar sin token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('debería fallar con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token_invalido');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});