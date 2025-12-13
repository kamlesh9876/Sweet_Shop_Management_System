import { useState, useEffect } from 'react'
import type { Sweet } from '../types/sweet'
import { sweetsAPI } from '../services/api'
import ProductModal from './ProductModal'
import EmployeeModal from './EmployeeModal'

interface AdminDashboardProps {
  sweets: Sweet[]
  loading?: boolean
  currentUser?: { id: string; name: string; email: string; role?: string }
  onSweetsUpdate?: () => void
}


// interface Customer {
//   id: string
//   name: string
//   email: string
//   phone: string
//   totalOrders: number
//   totalSpent: number
//   lastOrder: Date
//   loyaltyPoints: number
//   segment: string
//   status: 'active' | 'inactive' | 'vip'
//   preferences: string[]
// }

// interface Order {
//   id: string
//   customerName: string
//   items: { name: string; quantity: number; price: number }[]
//   total: number
//   status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
//   date: Date
//   priority: 'low' | 'medium' | 'high' | 'urgent'
//   paymentMethod: string
//   shippingAddress: string
//   trackingNumber?: string
//   notes?: string
// }

// interface Supplier {
//   id: string
//   name: string
//   contact: string
//   email: string
//   phone: string
//   reliability: number
//   averageDeliveryTime: number
//   quality: number
//   cost: number
//   products: string[]
//   lastOrder: Date
//   status: 'active' | 'inactive' | 'review'
// }

export default function AdminDashboard({ 
  sweets, 
  loading = false, 
  currentUser,
  onSweetsUpdate
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'sales' | 'orders' | 'customers' | 'suppliers' | 'employees' | 'analytics' | 'settings'>('overview')
  const [realStats, setRealStats] = useState<any>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Administrator', status: 'Active' }
  ])
  const [showAllActivity, setShowAllActivity] = useState(false)

  // Sample recent activity data
  const recentActivity = [
    { id: '#ORD-001', customer: 'John Smith', product: 'Chocolate Cake', amount: '$25.99', status: 'Completed', date: '2024-01-15', statusColor: 'green' },
    { id: '#ORD-002', customer: 'Sarah Johnson', product: 'Vanilla Cake', amount: '$22.99', status: 'Pending', date: '2024-01-15', statusColor: 'yellow' },
    { id: '#ORD-003', customer: 'Mike Davis', product: 'Cookies', amount: '$12.99', status: 'Processing', date: '2024-01-14', statusColor: 'blue' },
    { id: '#ORD-004', customer: 'Emily Wilson', product: 'Brownies', amount: '$18.50', status: 'Completed', date: '2024-01-14', statusColor: 'green' },
    { id: '#ORD-005', customer: 'David Brown', product: 'Cupcakes', amount: '$15.99', status: 'Pending', date: '2024-01-13', statusColor: 'yellow' },
    { id: '#ORD-006', customer: 'Lisa Anderson', product: 'Cheesecake', amount: '$28.75', status: 'Completed', date: '2024-01-13', statusColor: 'green' },
    { id: '#ORD-007', customer: 'James Miller', product: 'Donuts', amount: '$10.50', status: 'Processing', date: '2024-01-12', statusColor: 'blue' },
    { id: '#ORD-008', customer: 'Maria Garcia', product: 'Muffins', amount: '$14.25', status: 'Completed', date: '2024-01-12', statusColor: 'green' },
  ]

  const displayName = currentUser?.name || 'Admin'

  // Debug: Monitor sweets prop changes
  useEffect(() => {
    console.log('AdminDashboard: sweets prop changed:', sweets)
    console.log('AdminDashboard: sweets length:', sweets.length)
  }, [sweets])

  // Debug: Monitor active tab changes
  useEffect(() => {
    console.log('AdminDashboard: activeTab changed to:', activeTab)
  }, [activeTab])

  // Fetch real data
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Calculate real stats from sweets data
      const stats = {
        totalSweets: sweets.length,
        criticalItems: sweets.filter(s => s.quantity <= 5).length,
        totalOrders: Math.floor(Math.random() * 100) + 50, // Mock for now
        pendingOrders: Math.floor(Math.random() * 20) + 5, // Mock for now
        averageOrderValue: sweets.reduce((sum, s) => sum + s.price, 0) / sweets.length || 0,
        customerSatisfaction: 85 + Math.random() * 10, // Mock for now
        totalValue: sweets.reduce((sum, s) => sum + (s.price * s.quantity), 0),
        lowStockItems: sweets.filter(s => s.quantity <= 10).length,
        outOfStockItems: sweets.filter(s => s.quantity === 0).length,
        monthlyRevenue: sweets.reduce((sum, s) => sum + (s.price * s.quantity), 0) * 0.8,
        profitMargin: 22.8
      }
      setRealStats(stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const stats = realStats || {
    totalSweets: sweets.length,
    criticalItems: sweets.filter(s => s.quantity <= 5).length,
    totalOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    customerSatisfaction: 0,
    monthlyRevenue: 0,
    profitMargin: 0
  }

  // Product CRUD handlers
  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowProductModal(true)
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  const handleDeleteProduct = async (product: any) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await sweetsAPI.delete(product.id)
        alert('Product deleted successfully!')
        // Update data without reload
        if (onSweetsUpdate) {
          onSweetsUpdate()
        }
      } catch (error) {
        console.error('Failed to delete product:', error)
        alert('Failed to delete product')
      }
    }
  }

  const handleProductSubmit = async (productData: any) => {
    try {
      console.log('Submitting product:', productData)
      if (editingProduct) {
        console.log('Updating product with ID:', editingProduct.id)
        await sweetsAPI.update(editingProduct.id, productData)
        alert('Product updated successfully!')
      } else {
        console.log('Creating new product...')
        const result = await sweetsAPI.create(productData)
        console.log('Product created result:', result)
        alert('Product added successfully!')
      }
      // Update data without reload
      console.log('Triggering sweets update...')
      if (onSweetsUpdate) {
        onSweetsUpdate()
      }
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Failed to save product')
    }
  }

  // Employee CRUD handlers
  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setShowEmployeeModal(true)
  }

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee)
    setShowEmployeeModal(true)
  }

  const handleDeleteEmployee = async (employee: any) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        // Remove from state
        setEmployees(employees.filter(emp => emp.id !== employee.id))
        alert('Employee deleted successfully!')
      } catch (error) {
        console.error('Failed to delete employee:', error)
        alert('Failed to delete employee')
      }
    }
  }

  const handleEmployeeSubmit = async (employeeData: any) => {
    try {
      console.log('Saving employee:', employeeData)
      if (editingEmployee) {
        // Update existing employee
        setEmployees(employees.map(emp => 
          emp.id === editingEmployee.id 
            ? { ...emp, ...employeeData }
            : emp
        ))
        alert('Employee updated successfully!')
      } else {
        // Add new employee
        const newEmployee = {
          id: Math.max(...employees.map(emp => emp.id), 0) + 1,
          ...employeeData
        }
        setEmployees([...employees, newEmployee])
        alert('Employee added successfully!')
      }
    } catch (error) {
      console.error('Failed to save employee:', error)
      alert('Failed to save employee')
    }
  }
  // Real notifications based on system data
  const notifications = [
    ...(sweets.filter(s => s.quantity <= 5).map(sweet => ({
      id: `low-stock-${sweet.id}`,
      type: 'warning' as const,
      title: 'Low Stock Alert',
      message: `${sweet.name} is running low (${sweet.quantity} units)`,
      timestamp: new Date(),
      read: false,
      action: 'Restock'
    }))),
    ...(sweets.filter(s => s.quantity === 0).map(sweet => ({
      id: `out-of-stock-${sweet.id}`,
      type: 'error' as const,
      title: 'Out of Stock',
      message: `${sweet.name} is completely out of stock`,
      timestamp: new Date(),
      read: false,
      action: 'Restock Now'
    })))
  ]

  
  
  if (loading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="perfect-glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Sweet Shop</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'inventory', label: 'Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { id: 'sales', label: 'Sales', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
              { id: 'orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
              { id: 'customers', label: 'Customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              { id: 'employees', label: 'Employees', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as 'overview' | 'inventory' | 'sales' | 'orders' | 'customers' | 'suppliers' | 'employees' | 'analytics' | 'settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">{displayName.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-full mx-auto">
            {activeTab === 'overview' && (
              <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Products</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{stats.totalSweets}</div>
              <div className="text-sm text-gray-600">Total Items</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-orange-600 font-medium">Low Stock: {stats.criticalItems}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Revenue</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-xs text-green-600 font-medium">+{stats.profitMargin}% Growth</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Customers</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{stats.customerSatisfaction.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-xs text-green-600 font-medium">Excellent Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table-style Content Area */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button 
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showAllActivity ? 'Show Less' : 'View All'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(showAllActivity ? recentActivity : recentActivity.slice(0, 3)).map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${activity.statusColor}-100 text-${activity.statusColor}-800`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
              </>
            )}
            
            {activeTab === 'inventory' && (
              <>
                {console.log('Rendering inventory tab section, activeTab:', activeTab)}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventory Management</h3>
                  <p className="text-gray-600">Manage your product inventory and stock levels</p>
                </div>
                
                {/* Inventory Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Total Products</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalSweets}</div>
                    <div className="text-sm text-gray-600">Active items in inventory</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Low Stock Items</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.criticalItems}</div>
                    <div className="text-sm text-gray-600">Need restocking soon</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Out of Stock</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Items unavailable</div>
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Product Inventory</h4>
                      <button 
                        onClick={handleAddProduct}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Product
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          console.log('Rendering sweets table, sweets count:', sweets.length)
                          return sweets.map((sweet) => (
                          <tr key={sweet.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{sweet.name}</div>
                              <div className="text-sm text-gray-500">{sweet.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sweet.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sweet.price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sweet.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                sweet.quantity > 10 ? 'bg-green-100 text-green-800' :
                                sweet.quantity > 5 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {sweet.quantity > 10 ? 'In Stock' : sweet.quantity > 5 ? 'Low Stock' : 'Critical'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEditProduct(sweet)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(sweet)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))})()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>            
            )}
            
            {activeTab === 'sales' && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sales Overview</h3>
                  <p className="text-gray-600">Track your sales performance and revenue</p>
                </div>
                
                {/* Sales Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Monthly Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</div>
                    <div className="text-sm text-green-600">+12% from last month</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Total Orders</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                    <div className="text-sm text-gray-600">This month</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Avg Order Value</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Per transaction</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Profit Margin</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.profitMargin}%</div>
                    <div className="text-sm text-green-600">+2% improvement</div>
                  </div>
                </div>

                {/* Sales Chart Placeholder */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h4>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Sales chart will be displayed here</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Management</h3>
                  <p className="text-gray-600">Manage customer orders and fulfillment</p>
                </div>
                
                {/* Orders Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Total Orders</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                    <div className="text-sm text-gray-600">All time</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
                    <div className="text-sm text-gray-600">Awaiting processing</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalOrders - stats.pendingOrders}</div>
                    <div className="text-sm text-gray-600">Successfully delivered</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Cancelled</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">2</div>
                    <div className="text-sm text-gray-600">This month</div>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Recent Orders</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-001</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Smith</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3 items</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$45.99</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-15</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-002</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sarah Johnson</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2 items</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$28.50</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Processing
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-14</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'customers' && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Management</h3>
                  <p className="text-gray-600">Manage customer accounts and relationships</p>
                </div>
                
                {/* Customer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Total Customers</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">1,234</div>
                    <div className="text-sm text-green-600">+15% this month</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Active Customers</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">892</div>
                    <div className="text-sm text-gray-600">Last 30 days</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Satisfaction Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.customerSatisfaction.toFixed(1)}%</div>
                    <div className="text-sm text-green-600">+2% improvement</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Avg Order Frequency</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">2.3</div>
                    <div className="text-sm text-gray-600">Orders per month</div>
                  </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">Customer List</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">JS</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">John Smith</div>
                                <div className="text-sm text-gray-500">VIP Customer</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">john.smith@email.com</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$1,234.56</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'employees' && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee Management</h3>
                  <p className="text-gray-600">Manage employee accounts and permissions</p>
                </div>
                
                {/* Employee Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Total Employees</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">12</div>
                    <div className="text-sm text-gray-600">Active staff members</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">On Duty</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">8</div>
                    <div className="text-sm text-gray-600">Currently working</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">On Leave</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">2</div>
                    <div className="text-sm text-gray-600">Approved leave</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Departments</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">4</div>
                    <div className="text-sm text-gray-600">Active departments</div>
                  </div>
                </div>

                {/* Employees Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Employee List</h4>
                      <button 
                        onClick={handleAddEmployee}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Employee
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">{employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                  <div className="text-sm text-gray-500">{employee.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                                employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {employee.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEditEmployee(employee)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteEmployee(employee)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600">View detailed analytics and insights</p>
                </div>
                
                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h4>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Chart placeholder - Sales trend over time</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h4>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Chart placeholder - Revenue breakdown</p>
                    </div>
                  </div>
                </div>

                {/* Analytics Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Chocolate Cake</span>
                        <span className="text-sm font-medium text-gray-900">234 sales</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Vanilla Cake</span>
                        <span className="text-sm font-medium text-gray-900">189 sales</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cookies</span>
                        <span className="text-sm font-medium text-gray-900">156 sales</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avg. Order Value</span>
                        <span className="text-sm font-medium text-gray-900">${stats.averageOrderValue.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Return Rate</span>
                        <span className="text-sm font-medium text-gray-900">2.3%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Customer Lifetime</span>
                        <span className="text-sm font-medium text-gray-900">18 months</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="text-sm font-medium text-gray-900">3.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cart Abandonment</span>
                        <span className="text-sm font-medium text-gray-900">68.4%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Page Load Time</span>
                        <span className="text-sm font-medium text-gray-900">1.2s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'settings' && (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings</h3>
                  <p className="text-gray-600">Manage system settings and preferences</p>
                </div>
                
                {/* Settings Forms */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">General Settings</h4>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                      <input type="text" value="Sweet Shop" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" value="contact@sweetshop.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC-6 (Central Time)</option>
                        <option>UTC-7 (Mountain Time)</option>
                        <option>UTC-8 (Pacific Time)</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => console.log('Save Settings clicked')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleProductSubmit}
        product={editingProduct}
        mode={editingProduct ? 'edit' : 'add'}
      />

      <EmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSubmit={handleEmployeeSubmit}
        employee={editingEmployee}
        mode={editingEmployee ? 'edit' : 'add'}
      />
    </div>
  )
}
