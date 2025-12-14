import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (name: string, email: string, password: string, role: 'admin' | 'employee') => {
    const response = await api.post('/auth/register', { name, email, password, role })
    return response.data
  },
}

// Sweets API
export const sweetsAPI = {
  getAll: async (filters?: {
    search?: string
    category?: string
    maxPrice?: number
    inStock?: boolean
  }) => {
    const response = await api.get('/sweets', { params: filters })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/sweets/${id}`)
    return response.data
  },

  create: async (sweet: {
    name: string
    category: string
    price: number
    quantity: number
    description?: string
    image_url?: string
  }) => {
    const response = await api.post('/sweets', sweet)
    return response.data
  },

  update: async (id: string, updates: Partial<{
    name?: string
    category?: string
    price?: number
    quantity?: number
    description?: string
    image_url?: string
  }>) => {
    const response = await api.put(`/sweets/${id}`, updates)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/sweets/${id}`)
    return response.data
  },

  purchase: async (id: string, quantity: number) => {
    const response = await api.post(`/sweets/${id}/purchase`, { quantity })
    return response.data
  },

  restock: async (id: string, quantity: number) => {
    const response = await api.post(`/sweets/${id}/restock`, { quantity })
    return response.data
  },
}

// Employee API
export interface Employee {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  password: string;
  role?: 'employee';
}

export interface UpdateEmployeeRequest {
  name: string;
  email: string;
  role?: 'employee';
}

export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`)
    return response.data
  },

  create: async (employee: CreateEmployeeRequest) => {
    const response = await api.post('/employees', employee)
    return response.data
  },

  update: async (id: string, updates: UpdateEmployeeRequest) => {
    const response = await api.put(`/employees/${id}`, updates)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`)
    return response.data
  },
}

export default api
