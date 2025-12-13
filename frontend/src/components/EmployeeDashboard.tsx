import { useState, useMemo, useEffect } from 'react'
import type { Sweet, SweetFilters } from '../types/sweet'

interface EmployeeDashboardProps {
  sweets: Sweet[]
  loading?: boolean
  onFilterChange?: (filters: SweetFilters) => void
  onPurchase?: (sweetId: string, quantity?: number) => void
  onEditSweet?: (sweetId: string, updates?: Partial<Sweet>) => void
  onDeleteSweet?: (sweetId: string) => void
  onRestock?: (sweetId: string, quantity: number) => void
  currentUser?: { id: string; name: string; email: string; role?: string }
}


export default function EmployeeDashboard({ 
  sweets, 
  loading = false, 
  currentUser, 
  onRestock 
}: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'reports'>('dashboard')
  const [filters] = useState<SweetFilters>({})
  const [sortBy] = useState<'name' | 'price' | 'quantity' | 'category'>('name')
  const [sortOrder] = useState<'asc' | 'desc'>('asc')
  const [realStats, setRealStats] = useState<any>(null)

  const displayName = currentUser?.name || 'Employee'

  // Fetch real stats
  useEffect(() => {
    fetchEmployeeStats()
  }, [sweets])

  const fetchEmployeeStats = async () => {
    try {
      const stats = {
        totalSweets: sweets.length,
        criticalItems: sweets.filter(s => s.quantity <= 5).length,
        totalOrders: Math.floor(Math.random() * 50) + 20, // Mock for now
        pendingOrders: Math.floor(Math.random() * 10) + 2, // Mock for now
        averageOrderValue: sweets.reduce((sum, s) => sum + s.price, 0) / sweets.length || 0,
        customerSatisfaction: 88 + Math.random() * 8, // Mock for now
        monthlyRevenue: Math.floor(Math.random() * 10000) + 5000, // Mock for now
        profitMargin: Math.floor(Math.random() * 20) + 10, // Mock for now
      }
      setRealStats(stats)
    } catch (error) {
      console.error('Failed to fetch employee stats:', error)
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
    profitMargin: 0,
  }

  // Real notifications for employees
  const notifications = [
    ...(sweets.filter(s => s.quantity <= 5).map(sweet => ({
      id: `low-stock-${sweet.id}`,
      type: 'warning' as const,
      title: 'Low Stock Alert',
      message: `${sweet.name} needs restocking (${sweet.quantity} units left)`,
      timestamp: new Date(),
      read: false,
      action: 'Notify Manager'
    }))),
    ...(sweets.filter(s => s.quantity === 0).map(sweet => ({
      id: `out-of-stock-${sweet.id}`,
      type: 'error' as const,
      title: 'Out of Stock',
      message: `${sweet.name} is out of stock`,
      timestamp: new Date(),
      read: false,
      action: 'Notify Manager'
    })))
  ]

  const sortedSweets = useMemo(() => {
    const filtered = sweets.filter(sweet => {
      const matchesSearch = !filters.search || 
        sweet.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        sweet.description?.toLowerCase().includes(filters.search.toLowerCase())
      const matchesCategory = !filters.category || sweet.category === filters.category
      const matchesStock = filters.inStock === undefined || 
        (filters.inStock ? sweet.quantity > 0 : sweet.quantity === 0)
      const matchesPrice = !filters.maxPrice || sweet.price <= filters.maxPrice
      
      return matchesSearch && matchesCategory && matchesStock && matchesPrice
    })

    return filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'quantity':
          comparison = a.quantity - b.quantity
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [sweets, filters, sortBy, sortOrder])

  
  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Sweet Shop</h1>
              <p className="text-xs text-gray-500">Employee Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'inventory' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'orders' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'reports' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">Employee</p>
            </div>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">{displayName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {activeTab === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {displayName}</h2>
              <p className="text-gray-600">Here's what's happening with your inventory today.</p>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Orders</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-yellow-600 font-medium">{stats.pendingOrders} Pending</span>
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

        {/* Product Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedSweets.slice(0, 8).map((sweet) => (
              <div key={sweet.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{sweet.name}</h4>
                    <p className="text-sm text-gray-500">{sweet.category}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sweet.quantity > 10 ? 'bg-green-100 text-green-800' :
                    sweet.quantity > 5 ? 'bg-yellow-100 text-yellow-800' :
                    sweet.quantity > 0 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {sweet.quantity > 0 ? `${sweet.quantity} in stock` : 'Out of stock'}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">${sweet.price.toFixed(2)}</p>
                  {sweet.description && (
                    <p className="text-sm text-gray-600 mt-2">{sweet.description}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {onRestock && sweet.quantity <= 5 && (
                    <button
                      onClick={() => onRestock(sweet.id, 10)}
                      className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Restock
                    </button>
                  )}
                  <button
                    onClick={() => {
                      console.log('Purchase clicked for:', sweet.name)
                    }}
                    disabled={sweet.quantity === 0}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      sweet.quantity > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {sweet.quantity > 0 ? 'Purchase Item' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h2>
              <p className="text-gray-600">Manage and monitor all product inventory</p>
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
                <div className="text-sm text-gray-600">Items in inventory</div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Low Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.criticalItems}</div>
                <div className="text-sm text-gray-600">Need restocking</div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">In Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{sweets.filter(s => s.quantity > 0).length}</div>
                <div className="text-sm text-gray-600">Available items</div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
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
                    {sortedSweets.map((sweet) => (
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
                          {onRestock && sweet.quantity <= 5 && (
                            <button
                              onClick={() => onRestock(sweet.id, 10)}
                              className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors mr-2"
                            >
                              Restock
                            </button>
                          )}
                          <button
                            onClick={() => console.log('Purchase:', sweet.name)}
                            disabled={sweet.quantity === 0}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              sweet.quantity > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Purchase
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

        {activeTab === 'orders' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h2>
              <p className="text-gray-600">View and manage customer orders</p>
            </div>

            {/* Order Stats */}
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
                <div className="text-sm text-gray-600">All orders</div>
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
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Revenue</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Monthly revenue</div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
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
                    {[
                      { id: '#ORD-001', customer: 'John Smith', items: 'Chocolate Cake, Cookies', total: '$38.98', status: 'Completed', date: '2024-01-15', statusColor: 'green' },
                      { id: '#ORD-002', customer: 'Sarah Johnson', items: 'Vanilla Cake', total: '$22.99', status: 'Pending', date: '2024-01-15', statusColor: 'yellow' },
                      { id: '#ORD-003', customer: 'Mike Davis', items: 'Brownies, Donuts', total: '$28.49', status: 'Processing', date: '2024-01-14', statusColor: 'blue' },
                      { id: '#ORD-004', customer: 'Emily Wilson', items: 'Cupcakes', total: '$15.99', status: 'Completed', date: '2024-01-14', statusColor: 'green' },
                    ].map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.items}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${order.statusColor}-100 text-${order.statusColor}-800`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
              <p className="text-gray-600">View detailed business reports and analytics</p>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Sales Report</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Sales</h3>
                <p className="text-sm text-gray-600">Detailed sales analysis and trends</p>
                <div className="mt-4 text-sm text-blue-600 font-medium">View Report →</div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Inventory Report</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Analysis</h3>
                <p className="text-sm text-gray-600">Inventory levels and restocking needs</p>
                <div className="mt-4 text-sm text-blue-600 font-medium">View Report →</div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Customer Report</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Analytics</h3>
                <p className="text-sm text-gray-600">Customer behavior and satisfaction</p>
                <div className="mt-4 text-sm text-blue-600 font-medium">View Report →</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Sales chart will be displayed here</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Category chart will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.profitMargin}%</div>
                    <div className="text-sm text-gray-600">Profit Margin</div>
                    <div className="text-xs text-green-600 mt-1">↑ 2% from last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Avg Order Value</div>
                    <div className="text-xs text-green-600 mt-1">↑ 5% from last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.customerSatisfaction.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Customer Satisfaction</div>
                    <div className="text-xs text-green-600 mt-1">↑ 1% from last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="text-xs text-green-600 mt-1">↑ 12% from last month</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
)
}
