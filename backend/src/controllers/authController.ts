import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../models/database';
import { generateToken } from '../middleware/auth';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Use role from request body (admin or employee)
      const role = req.body.role || 'employee';

      // Create user
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          const user = {
            id: this.lastID,
            email,
            name,
            role
          };

          const token = generateToken({ id: user.id, email: user.email, role: user.role });

          const response: AuthResponse = {
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role as 'admin' | 'employee', created_at: new Date().toISOString() }
          };

          res.status(201).json(response);
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, row: any) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, row.password);

        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = {
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.role
        };

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        const response: AuthResponse = {
          token,
          user: { id: row.id, email: row.email, name: row.name, role: row.role, created_at: row.created_at }
        };

        res.json(response);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
