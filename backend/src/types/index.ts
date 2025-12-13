export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: string;
  sweet_id: number;
  quantity: number;
  price: number;
}

export interface CreateSweetRequest {
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image_url?: string;
}

export interface UpdateSweetRequest {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  description?: string;
  image_url?: string;
}

export interface PurchaseRequest {
  quantity: number;
}

export interface RestockRequest {
  quantity: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}
