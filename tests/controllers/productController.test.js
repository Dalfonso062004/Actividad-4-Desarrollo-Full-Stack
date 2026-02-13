// tests/controllers/productController.test.js
const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');

describe('Product Controller', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: '123456'
    });
    userId = user._id;

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: '123456'
      });
    token = res.body.token;
  });

  describe('GET /api/products', () => {
    it('debería obtener todos los productos del usuario', async () => {
      await Product.create([
        {
          name: 'Producto 1',
          description: 'Descripción 1',
          price: 100,
          category: 'Electrónica',
          stock: 10,
          user: userId
        },
        {
          name: 'Producto 2',
          description: 'Descripción 2',
          price: 200,
          category: 'Ropa',
          stock: 20,
          user: userId
        }
      ]);

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products.length).toBe(2);
    });
  });

  describe('POST /api/products', () => {
    it('debería crear un nuevo producto', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nuevo Producto',
          description: 'Descripción del producto',
          price: 150,
          category: 'Libros',
          stock: 5
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product.name).toBe('Nuevo Producto');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('debería actualizar un producto', async () => {
      const product = await Product.create({
        name: 'Producto Original',
        description: 'Descripción original',
        price: 100,
        category: 'Electrónica',
        stock: 10,
        user: userId
      });

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Producto Actualizado',
          price: 150
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.name).toBe('Producto Actualizado');
      expect(res.body.product.price).toBe(150);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debería eliminar un producto', async () => {
      const product = await Product.create({
        name: 'Producto a Eliminar',
        description: 'Descripción',
        price: 100,
        category: 'Electrónica',
        stock: 10,
        user: userId
      });

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });
  });
});