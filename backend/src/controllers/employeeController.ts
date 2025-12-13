import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../models/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE role != "admin" ORDER BY created_at DESC';
    
    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = ? AND role != "admin"';
    
    db.get(query, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      res.json(row);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (role !== 'employee') {
      return res.status(400).json({ error: 'Only employee role can be created' });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create employee
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create employee' });
          }

          const employee = {
            id: this.lastID,
            name,
            email,
            role,
            created_at: new Date().toISOString()
          };

          res.status(201).json(employee);
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (role !== 'employee') {
      return res.status(400).json({ error: 'Only employee role is allowed' });
    }

    // Check if employee exists and is not admin
    db.get('SELECT id FROM users WHERE id = ? AND role != "admin"', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Check if email is already used by another user
      db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id], (err, emailRow) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (emailRow) {
          return res.status(400).json({ error: 'Email is already used by another user' });
        }

        // Update employee
        db.run(
          'UPDATE users SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [name, email, role, id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update employee' });
            }

            // Return updated employee
            db.get(
              'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
              [id],
              (err, employee) => {
                if (err) {
                  return res.status(500).json({ error: 'Database error' });
                }

                res.json(employee);
              }
            );
          }
        );
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if employee exists and is not admin
    db.get('SELECT id FROM users WHERE id = ? AND role != "admin"', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Delete employee
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete employee' });
        }

        res.json({ message: 'Employee deleted successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};
