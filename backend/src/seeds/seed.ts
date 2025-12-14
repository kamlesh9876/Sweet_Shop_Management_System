import sqlite3 from 'sqlite3'
import bcrypt from 'bcryptjs'

const dbPath = process.env.DB_PATH || './database.sqlite'

export async function seed() {
  const db = new sqlite3.Database(dbPath)
  
  // Helper functions for async database operations
  const run = (sql: string, params?: any[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }
  
  const get = (sql: string, params?: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }
  
  try {
    console.log('Starting database seeding...')
    
    // Check if admin user exists
    const existingAdmin = await get('SELECT * FROM users WHERE email = ?', ['admin@sweetshop.com'])
    
    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await run(`
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, ['Admin User', 'admin@sweetshop.com', hashedPassword, 'admin'])
      
      console.log('Admin user created')
    }
    
    // Check if sweets exist
    const sweetsCount = await get('SELECT COUNT(*) as count FROM sweets')
    
    if (sweetsCount && sweetsCount.count === 0) {
      // Insert sample sweets
      const sweets = [
        {
          name: 'Chocolate Cake',
          category: 'Cakes',
          price: 12.99,
          quantity: 10,
          description: 'Delicious chocolate cake with rich frosting',
          image_url: '/images/sweets/chocolate-cake.jpg'
        },
        {
          name: 'Vanilla Ice Cream',
          category: 'Ice Cream',
          price: 4.99,
          quantity: 15,
          description: 'Creamy vanilla ice cream',
          image_url: '/images/sweets/vanilla-ice-cream.jpg'
        },
        {
          name: 'Strawberry Tart',
          category: 'Tarts',
          price: 8.99,
          quantity: 8,
          description: 'Fresh strawberry tart with glazed topping',
          image_url: '/images/sweets/strawberry-tart.jpg'
        },
        {
          name: 'Chocolate Chip Cookies',
          category: 'Cookies',
          price: 3.99,
          quantity: 20,
          description: 'Homemade chocolate chip cookies',
          image_url: '/images/sweets/chocolate-cookies.jpg'
        },
        {
          name: 'Fruit Cake',
          category: 'Cakes',
          price: 15.99,
          quantity: 5,
          description: 'Traditional fruit cake with mixed fruits',
          image_url: '/images/sweets/fruit-cake.jpg'
        }
      ]
      
      for (const sweet of sweets) {
        await run(
          `INSERT INTO sweets (name, category, price, quantity, description, image_url) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [sweet.name, sweet.category, sweet.price, sweet.quantity, sweet.description, sweet.image_url]
        )
      }
      
      console.log('Sample sweets created')
    }
    
    console.log('Database seeding completed successfully')
  } catch (error) {
    console.error('Seeding failed:', error)
    throw error
  } finally {
    db.close()
  }
}

if (require.main === module) {
  seed()
}
