import { Router } from 'express';
import {
  getAllSweets,
  getSweetById,
  createSweet,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} from '../controllers/sweetController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllSweets);
router.get('/search', getAllSweets); // Search endpoint
router.get('/:id', getSweetById);

// Protected routes
router.post('/', authenticateToken, requireAdmin, createSweet);
router.put('/:id', authenticateToken, requireAdmin, updateSweet);
router.delete('/:id', authenticateToken, requireAdmin, deleteSweet);

// Inventory operations
router.post('/:id/purchase', authenticateToken, purchaseSweet);
router.post('/:id/restock', authenticateToken, requireAdmin, restockSweet);

export default router;
