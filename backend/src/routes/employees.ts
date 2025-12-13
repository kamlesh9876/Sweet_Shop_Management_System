import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All employee routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/employees - Get all employees
router.get('/', getAllEmployees);

// GET /api/employees/:id - Get employee by ID
router.get('/:id', getEmployeeById);

// POST /api/employees - Create new employee
router.post('/', createEmployee);

// PUT /api/employees/:id - Update employee
router.put('/:id', updateEmployee);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', deleteEmployee);

export default router;
