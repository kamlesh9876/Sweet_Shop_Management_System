import { beforeAll, afterAll } from 'vitest'
import sqlite3 from 'sqlite3'

export let testDb: sqlite3.Database

beforeAll(async () => {
  // Create in-memory test database
  testDb = new sqlite3.Database(':memory:')
  
  // Initialize test database schema
  await new Promise<void>((resolve, reject) => {
    testDb.serialize(() => {
      testDb.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'customer',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      testDb.run(`
        CREATE TABLE sweets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      testDb.run(`
        CREATE TABLE orders (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          total REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `)
      
      testDb.run(`
        CREATE TABLE order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT NOT NULL,
          sweet_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (sweet_id) REFERENCES sweets (id)
        )
      `, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  })
})

afterAll(async () => {
  // Close test database
  if (testDb) {
    await new Promise<void>((resolve) => {
      testDb.close(() => resolve())
    })
  }
})
