import sqlite3 from 'sqlite3';
import path from 'path';

// Use test database if in test environment
const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DB_PATH || './database.sqlite');

export const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sweets table
  db.run(`
    CREATE TABLE IF NOT EXISTS sweets (
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
  `);

  // Create orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Create order_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      sweet_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (sweet_id) REFERENCES sweets (id)
    )
  `);

  // Insert sample data
  insertSampleData();
}

function insertSampleData() {
  // Check if sweets table has data
  db.get("SELECT COUNT(*) as count FROM sweets", (err, row: any) => {
    if (err) {
      console.error('Error checking sweets table:', err.message);
      return;
    }

    if (row.count === 0) {
      // Insert sample sweets
      const sampleSweets = [
        {
          name: 'Birthday Cake',
          category: 'Cakes',
          price: 12.99,
          quantity: 10,
          description: 'Delicious birthday cake with layers of cream',
          image_url: '/images/sweets/Birthday cake-pana.png'
        },
        {
          name: 'Sweet Choice',
          category: 'Candy',
          price: 5.99,
          quantity: 0,
          description: 'Assorted sweet treats',
          image_url: '/images/sweets/Choice-pana.png'
        },
        {
          name: 'Chocolate Donut',
          category: 'Donuts',
          price: 3.99,
          quantity: 3,
          description: 'Glazed chocolate donut with sprinkles',
          image_url: '/images/sweets/Choice-pana.png'
        },
        {
          name: 'Vanilla Ice Cream',
          category: 'Ice Cream',
          price: 4.99,
          quantity: 15,
          description: 'Creamy vanilla ice cream',
          image_url: '/images/sweets/Choice-pana.png'
        },
        {
          name: 'Strawberry Pastry',
          category: 'Pastries',
          price: 6.99,
          quantity: 2,
          description: 'Fresh strawberry pastry with cream',
          image_url: '/images/sweets/Eating healthy food-rafiki.png'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO sweets (name, category, price, quantity, description, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleSweets.forEach(sweet => {
        stmt.run([sweet.name, sweet.category, sweet.price, sweet.quantity, sweet.description, sweet.image_url]);
      });

      stmt.finalize();
      console.log('Sample sweets data inserted');
    }
  });
}

export default db;
