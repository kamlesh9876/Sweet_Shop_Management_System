import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../src/index'
import sqlite3 from 'sqlite3'
import { testDb } from './setup'
let authToken: string
let testUserId: number

beforeEach(async () => {
  // Clear database before each test
  await new Promise<void>((resolve) => {
    testDb.run('DELETE FROM sweets', () => resolve())
    testDb.run('DELETE FROM users', () => resolve())
  })

  // Create test user and get auth token
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    })

  authToken = registerResponse.body.token
  testUserId = registerResponse.body.user.id
})

afterEach(async () => {
  // Clean up after each test
  await new Promise<void>((resolve) => {
    testDb.run('DELETE FROM sweets', () => resolve())
    testDb.run('DELETE FROM users', () => resolve())
  })
})

describe('Sweets CRUD Endpoints', () => {
  describe('POST /api/sweets', () => {
    it('should create a new sweet (admin only)', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        category: 'Cakes',
        price: 12.99,
        quantity: 10,
        description: 'Delicious chocolate cake',
        image_url: '/images/chocolate-cake.jpg'
      }

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(201)

      expect(response.body.name).toBe(sweetData.name)
      expect(response.body.category).toBe(sweetData.category)
      expect(response.body.price).toBe(sweetData.price)
      expect(response.body.quantity).toBe(sweetData.quantity)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('created_at')
    })

    it('should return 401 without authentication', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        category: 'Cakes',
        price: 12.99,
        quantity: 10
      }

      await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401)
    })

    it('should return 403 for non-admin users', async () => {
      // Create employee user
      const employeeResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Employee',
          email: 'employee@example.com',
          password: 'password123',
          role: 'employee'
        })

      const employeeToken = employeeResponse.body.token

      const sweetData = {
        name: 'Chocolate Cake',
        category: 'Cakes',
        price: 12.99,
        quantity: 10
      }

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(sweetData)
        .expect(403)
    })

    it('should return 400 with missing required fields', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Cake'
          // Missing category, price, quantity
        })
        .expect(400)

      expect(response.body.error).toContain('Missing required fields')
    })
  })

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create test sweets
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Cake',
          category: 'Cakes',
          price: 12.99,
          quantity: 10
        })

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Vanilla Ice Cream',
          category: 'Ice Cream',
          price: 4.99,
          quantity: 15
        })
    })

    it('should return all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('Chocolate Cake')
      expect(response.body[1].name).toBe('Vanilla Ice Cream')
    })
  })

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      // Create test sweets
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Cake',
          category: 'Cakes',
          price: 12.99,
          quantity: 10
        })

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Vanilla Ice Cream',
          category: 'Ice Cream',
          price: 4.99,
          quantity: 0
        })
    })

    it('should filter sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?search=Chocolate')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe('Chocolate Cake')
    })

    it('should filter sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Cakes')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].category).toBe('Cakes')
    })

    it('should filter sweets by max price', async () => {
      const response = await request(app)
        .get('/api/sweets/search?maxPrice=5')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].price).toBe(4.99)
    })

    it('should filter sweets in stock only', async () => {
      const response = await request(app)
        .get('/api/sweets/search?inStock=true')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].quantity).toBeGreaterThan(0)
    })
  })

  describe('PUT /api/sweets/:id', () => {
    let sweetId: number

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Cake',
          category: 'Cakes',
          price: 12.99,
          quantity: 10
        })

      sweetId = response.body.id
    })

    it('should update a sweet (admin only)', async () => {
      const updateData = {
        name: 'Updated Chocolate Cake',
        price: 15.99
      }

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.message).toBe('Sweet updated successfully')
    })

    it('should return 404 for non-existent sweet', async () => {
      await request(app)
        .put('/api/sweets/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404)
    })
  })

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: number

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Cake',
          category: 'Cakes',
          price: 12.99,
          quantity: 10
        })

      sweetId = response.body.id
    })

    it('should delete a sweet (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.message).toBe('Sweet deleted successfully')
    })

    it('should return 404 for non-existent sweet', async () => {
      await request(app)
        .delete('/api/sweets/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })
})

describe('Inventory Operations', () => {
  let sweetId: number

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Chocolate Cake',
        category: 'Cakes',
        price: 12.99,
        quantity: 10
      })

    sweetId = response.body.id
  })

  describe('POST /api/sweets/:id/purchase', () => {
    it('should purchase a sweet successfully', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 2 })
        .expect(200)

      expect(response.body.message).toBe('Purchase successful')
      expect(response.body.order).toHaveProperty('id')
      expect(response.body.order.total).toBe(25.98) // 12.99 * 2
    })

    it('should return 400 when insufficient stock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 20 })
        .expect(400)

      expect(response.body.error).toBe('Insufficient stock')
    })

    it('should return 404 for non-existent sweet', async () => {
      await request(app)
        .post('/api/sweets/999/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 1 })
        .expect(404)
    })
  })

  describe('POST /api/sweets/:id/restock', () => {
    it('should restock a sweet successfully (admin only)', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 5 })
        .expect(200)

      expect(response.body.message).toBe('Sweet restocked successfully')
    })

    it('should return 404 for non-existent sweet', async () => {
      await request(app)
        .post('/api/sweets/999/restock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 5 })
        .expect(404)
    })
  })
})
