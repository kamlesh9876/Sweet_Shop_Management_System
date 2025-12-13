import { Request, Response } from 'express';
import { db } from '../models/database';
import { CreateSweetRequest, UpdateSweetRequest, PurchaseRequest, RestockRequest } from '../types';
import { AuthRequest } from '../middleware/auth';

export const getAllSweets = (req: Request, res: Response) => {
  const { search, category, maxPrice, inStock } = req.query;
  
  let query = 'SELECT * FROM sweets WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(parseFloat(maxPrice as string));
  }

  if (inStock === 'true') {
    query += ' AND quantity > 0';
  } else if (inStock === 'false') {
    query += ' AND quantity = 0';
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
};

export const getSweetById = (req: Request, res: Response) => {
  const { id } = req.params;

  db.get('SELECT * FROM sweets WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json(row);
  });
};

export const createSweet = (req: Request, res: Response) => {
  const { name, category, price, quantity, description, image_url }: CreateSweetRequest = req.body;

  if (!name || !category || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, category, price, quantity' });
  }

  db.run(
    'INSERT INTO sweets (name, category, price, quantity, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, price, quantity, description || '', image_url || ''],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create sweet' });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        category,
        price,
        quantity,
        description,
        image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  );
};

export const updateSweet = (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: UpdateSweetRequest = req.body;

  // Build dynamic query
  const fields = [];
  const params = [];

  if (updates.name) {
    fields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.category) {
    fields.push('category = ?');
    params.push(updates.category);
  }
  if (updates.price !== undefined) {
    fields.push('price = ?');
    params.push(updates.price);
  }
  if (updates.quantity !== undefined) {
    fields.push('quantity = ?');
    params.push(updates.quantity);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    params.push(updates.description);
  }
  if (updates.image_url !== undefined) {
    fields.push('image_url = ?');
    params.push(updates.image_url);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const query = `UPDATE sweets SET ${fields.join(', ')} WHERE id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update sweet' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({ message: 'Sweet updated successfully' });
  });
};

export const deleteSweet = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM sweets WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete sweet' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({ message: 'Sweet deleted successfully' });
  });
};

export const purchaseSweet = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { quantity }: PurchaseRequest = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Get sweet and check stock
    db.get('SELECT * FROM sweets WHERE id = ?', [id], (err, sweet: any) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      if (!sweet) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Sweet not found' });
      }

      if (sweet.quantity < quantity) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      // Update sweet quantity
      db.run(
        'UPDATE sweets SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [quantity, id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to update stock' });
          }

          // Create order
          const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const total = sweet.price * quantity;

          db.run(
            'INSERT INTO orders (id, user_id, total) VALUES (?, ?, ?)',
            [orderId, userId, total],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to create order' });
              }

              // Create order item
              db.run(
                'INSERT INTO order_items (order_id, sweet_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, id, quantity, sweet.price],
                function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Failed to create order item' });
                  }

                  db.run('COMMIT');
                  res.json({
                    message: 'Purchase successful',
                    order: {
                      id: orderId,
                      total,
                      items: [{
                        sweet_id: id,
                        sweet_name: sweet.name,
                        quantity,
                        price: sweet.price
                      }]
                    }
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};

export const restockSweet = (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity }: RestockRequest = req.body;

  db.run(
    'UPDATE sweets SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to restock sweet' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sweet not found' });
      }

      res.json({ message: 'Sweet restocked successfully' });
    }
  );
};
