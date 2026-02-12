const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');

describe('Product Routes', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;

    const jwt = require('jsonwebtoken');
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  });

  describe('GET /api/products', () => {
    it('should get all products for user', async () => {
      await Product.create([
        { name: 'Product 1', description: 'Desc 1', price: 100, category: 'Electrónica', stock: 10, user: userId },
        { name: 'Product 2', description: 'Desc 2', price: 200, category: 'Ropa', stock: 20, user: userId }
      ]);

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(2);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Product',
          description: 'New Description',
          price: 150,
          category: 'Libros',
          stock: 5
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.product.name).toBe('New Product');
    });
  });
});