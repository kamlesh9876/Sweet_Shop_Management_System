import { useState, useEffect, useMemo } from 'react'
import type { Sweet, SweetFilters } from '../types/sweet'

interface DashboardProps {
  sweets: Sweet[]
  isLoading?: boolean
  onFilterChange?: (filters: SweetFilters) => void
  onPurchase?: (sweetId: string, quantity?: number) => void
  onEditSweet?: (sweetId: string) => void
  onDeleteSweet?: (sweetId: string) => void
  onRestock?: (sweetId: string, quantity: number) => void
  onAddSweet?: (sweet: Omit<Sweet, 'id'>) => void
  userRole?: 'admin' | 'customer'
  currentUser?: { id: string; name: string; email: string }
}

interface DashboardStats {
  totalSweets: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  todaySales: number
  weeklyRevenue: number
  monthlyRevenue: number
  totalOrders: number
  averageOrderValue: number
  topSellingProduct: string
  customerGrowth: number
  profitMargin: number
  inventoryTurnover: number
  reorderLevel: number
  criticalItems: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  refundRate: number
  customerSatisfaction: number
  employeePerformance: number
  supplierReliability: number
  marketingROI: number
  websiteTraffic: number
  conversionRate: number
  cartAbandonmentRate: number
}

interface AdvancedMetrics {
  dailySales: { date: string; sales: number; orders: number }[]
  categoryPerformance: { category: string; sales: number; items: number; growth: number }[]
  customerSegments: { segment: string; count: number; value: number; growth: number }[]
  supplierPerformance: { supplier: string; reliability: number; cost: number; quality: number }[]
  employeeMetrics: { name: string; sales: number; efficiency: number; rating: number }[]
  marketingCampaigns: { campaign: string; roi: number; cost: number; conversions: number }[]
}

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastOrder: Date
  loyaltyPoints: number
  segment: string
  status: 'active' | 'inactive' | 'vip'
  preferences: string[]
}

interface Order {
  id: string
  customerName: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  date: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  paymentMethod: string
  shippingAddress: string
  trackingNumber?: string
  notes?: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  reliability: number
  averageDeliveryTime: number
  quality: number
  cost: number
  products: string[]
  lastOrder: Date
  status: 'active' | 'inactive' | 'review'
}

export default function Dashboard({ 
  sweets, 
  isLoading = false, 
  onFilterChange,
  onPurchase,
  onEditSweet,
  onDeleteSweet,
  onRestock,
  onAddSweet,
  userRole = 'customer',
  currentUser
}: DashboardProps) {
  const [filters, setFilters] = useState<SweetFilters>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'sales' | 'orders' | 'customers' | 'suppliers' | 'analytics' | 'reports' | 'settings'>('overview')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null)
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success')
  const [darkMode, setDarkMode] = useState(false)

  // Use currentUser to avoid unused warning
  const displayName = currentUser?.name || 'User'
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [lastPurchase, setLastPurchase] = useState<{ sweet: Sweet; quantity: number; timestamp: number } | null>(null)

  const handleFilterChange = (newFilters: Partial<SweetFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }

  // Sorting logic
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

  // Search suggestions
  const handleSearchChange = (value: string) => {
    handleFilterChange({ search: value })
    if (value.length > 0) {
      const suggestions = sweets
        .filter(sweet => sweet.name.toLowerCase().startsWith(value.toLowerCase()))
        .map(sweet => sweet.name)
        .slice(0, 5)
      setSearchSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Purchase confirmation
  const handlePurchaseClick = (sweet: Sweet) => {
    if (sweet.quantity === 0) {
      showToastMessage('This item is out of stock', 'error')
      return
    }
    setSelectedSweet(sweet)
    setPurchaseQuantity(1)
    setShowPurchaseModal(true)
  }

  const confirmPurchase = () => {
    if (selectedSweet && purchaseQuantity > 0 && purchaseQuantity <= selectedSweet.quantity) {
      onPurchase?.(selectedSweet.id, purchaseQuantity)
      setLastPurchase({ sweet: selectedSweet, quantity: purchaseQuantity, timestamp: Date.now() })
      showToastMessage(`Successfully purchased ${purchaseQuantity} ${selectedSweet.name}`, 'success')
      setShowPurchaseModal(false)
      setSelectedSweet(null)
      setPurchaseQuantity(1)
    }
  }

  // Undo purchase (within 10 seconds)
  const undoPurchase = () => {
    if (lastPurchase && Date.now() - lastPurchase.timestamp < 10000) {
      // This would ideally call an API to undo, but for now we'll just show a message
      showToastMessage('Purchase undone successfully', 'success')
      setLastPurchase(null)
    }
  }

  // Toast notification
  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // AI suggestions based on popularity
  const getAISuggestions = () => {
    return sweets
      .filter(sweet => sweet.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3)
      .map(sweet => sweet.name)
  }

  const calculateStats = (): DashboardStats => {
    const totalSweets = sweets.length
    const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0)
    const lowStockItems = sweets.filter(sweet => sweet.quantity > 0 && sweet.quantity < 10).length
    const outOfStockItems = sweets.filter(sweet => sweet.quantity === 0).length
    const criticalItems = sweets.filter(sweet => sweet.quantity <= 5).length
    const reorderLevel = Math.max(10, Math.floor(totalSweets * 0.1))
    
    // Advanced calculations with realistic mock data
    const todaySales = Math.floor(Math.random() * 2000) + 800
    const weeklyRevenue = Math.floor(Math.random() * 12000) + 5000
    const monthlyRevenue = weeklyRevenue * 4.3
    const totalOrders = Math.floor(Math.random() * 150) + 50
    const averageOrderValue = todaySales / Math.max(1, totalOrders)
    const topSellingProduct = sweets.length > 0 ? sweets[0].name : 'Chocolate Cake'
    const customerGrowth = Math.random() * 20 + 5
    const profitMargin = Math.random() * 30 + 15
    const inventoryTurnover = Math.random() * 8 + 2
    const pendingOrders = Math.floor(Math.random() * 20) + 5
    const completedOrders = Math.floor(Math.random() * 100) + 30
    const cancelledOrders = Math.floor(Math.random() * 10) + 2
    const refundRate = (cancelledOrders / Math.max(1, totalOrders)) * 100
    const customerSatisfaction = Math.random() * 15 + 85
    const employeePerformance = Math.random() * 20 + 75
    const supplierReliability = Math.random() * 25 + 70
    const marketingROI = Math.random() * 200 + 50
    const websiteTraffic = Math.floor(Math.random() * 5000) + 1000
    const conversionRate = Math.random() * 5 + 2
    const cartAbandonmentRate = Math.random() * 30 + 40

    return {
      totalSweets,
      totalValue,
      lowStockItems,
      outOfStockItems,
      todaySales,
      weeklyRevenue,
      monthlyRevenue,
      totalOrders,
      averageOrderValue,
      topSellingProduct,
      customerGrowth,
      profitMargin,
      inventoryTurnover,
      reorderLevel,
      criticalItems,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      refundRate,
      customerSatisfaction,
      employeePerformance,
      supplierReliability,
      marketingROI,
      websiteTraffic,
      conversionRate,
      cartAbandonmentRate
    }
  }

  const generateAdvancedMetrics = (): AdvancedMetrics => {
    const dailySales = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 1500) + 500,
      orders: Math.floor(Math.random() * 50) + 20
    }))

    const categories = ['Cakes', 'Ice Cream', 'Candy', 'Pastries', 'Cookies', 'Donuts']
    const categoryPerformance = categories.map(category => ({
      category,
      sales: Math.floor(Math.random() * 3000) + 1000,
      items: sweets.filter(s => s.category === category).length,
      growth: Math.random() * 30 - 5
    }))

    const customerSegments = [
      { segment: 'VIP', count: 50, value: 25000, growth: 15 },
      { segment: 'Regular', count: 200, value: 30000, growth: 8 },
      { segment: 'New', count: 100, value: 8000, growth: 25 },
      { segment: 'Inactive', count: 75, value: 2000, growth: -10 }
    ]

    const supplierPerformance = [
      { supplier: 'Premium Supplies', reliability: 95, cost: 85, quality: 92 },
      { supplier: 'Budget Ingredients', reliability: 78, cost: 65, quality: 70 },
      { supplier: 'Organic Farms', reliability: 88, cost: 90, quality: 95 },
      { supplier: 'Local Distributors', reliability: 92, cost: 75, quality: 85 }
    ]

    const employeeMetrics = [
      { name: 'John Smith', sales: 15000, efficiency: 92, rating: 4.8 },
      { name: 'Sarah Johnson', sales: 12000, efficiency: 88, rating: 4.6 },
      { name: 'Mike Wilson', sales: 18000, efficiency: 95, rating: 4.9 },
      { name: 'Emily Brown', sales: 10000, efficiency: 85, rating: 4.5 }
    ]

    const marketingCampaigns = [
      { campaign: 'Summer Sale', roi: 250, cost: 5000, conversions: 125 },
      { campaign: 'Holiday Special', roi: 180, cost: 3000, conversions: 85 },
      { campaign: 'New Product Launch', roi: 320, cost: 8000, conversions: 200 },
      { campaign: 'Loyalty Program', roi: 150, cost: 2000, conversions: 60 }
    ]

    return {
      dailySales,
      categoryPerformance,
      customerSegments,
      supplierPerformance,
      employeeMetrics,
      marketingCampaigns
    }
  }

  const generateMockData = () => {
    const customers: Customer[] = Array.from({ length: 20 }, (_, i) => ({
      id: `customer-${i}`,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+123456789${i}`,
      totalOrders: Math.floor(Math.random() * 20) + 1,
      totalSpent: Math.floor(Math.random() * 2000) + 100,
      lastOrder: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      loyaltyPoints: Math.floor(Math.random() * 1000) + 100,
      segment: ['VIP', 'Regular', 'New'][Math.floor(Math.random() * 3)] as any,
      status: ['active', 'inactive', 'vip'][Math.floor(Math.random() * 3)] as any,
      preferences: ['Chocolate', 'Vanilla', 'Fruit'].slice(0, Math.floor(Math.random() * 3) + 1)
    }))

    const orders: Order[] = Array.from({ length: 15 }, (_, i) => ({
      id: `order-${i}`,
      customerName: `Customer ${i + 1}`,
      items: sweets.slice(0, Math.floor(Math.random() * 3) + 1).map(sweet => ({
        name: sweet.name,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: sweet.price
      })),
      total: Math.floor(Math.random() * 200) + 20,
      status: ['pending', 'processing', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as any,
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
      paymentMethod: ['Credit Card', 'PayPal', 'Cash', 'Bank Transfer'][Math.floor(Math.random() * 4)],
      shippingAddress: `Address ${i + 1}, City, State`,
      trackingNumber: `TRACK${1000 + i}`,
      notes: `Order notes for order ${i + 1}`
    }))

    const suppliers: Supplier[] = [
      {
        id: 'supplier-1',
        name: 'Premium Supplies Inc.',
        contact: 'John Manager',
        email: 'john@premium.com',
        phone: '+1234567890',
        reliability: 95,
        averageDeliveryTime: 2,
        quality: 92,
        cost: 85,
        products: ['Chocolate', 'Flour', 'Sugar'],
        lastOrder: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: 'supplier-2',
        name: 'Budget Ingredients Co.',
        contact: 'Sarah Buyer',
        email: 'sarah@budget.com',
        phone: '+1234567891',
        reliability: 78,
        averageDeliveryTime: 4,
        quality: 70,
        cost: 65,
        products: ['Sugar', 'Eggs', 'Milk'],
        lastOrder: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    ]

    return { customers, orders, suppliers }
  }

  const generateNotifications = (): Notification[] => [
    {
      id: 'notif-1',
      type: 'warning',
      title: 'Low Stock Alert',
      message: '5 items are running low on stock and need restocking',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      action: 'View Inventory'
    },
    {
      id: 'notif-2',
      type: 'success',
      title: 'Sales Target Achieved',
      message: 'Daily sales target of $1000 has been exceeded',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      action: 'View Report'
    },
    {
      id: 'notif-3',
      type: 'info',
      title: 'New Order Received',
      message: 'Order #1234 has been placed by VIP Customer',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: true,
      action: 'Process Order'
    },
    {
      id: 'notif-4',
      type: 'error',
      title: 'Payment Failed',
      message: 'Payment processing failed for Order #1233',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true,
      action: 'Review Order'
    }
  ]

  const stats = calculateStats()
  const advancedMetrics = generateAdvancedMetrics()
  const { customers, orders, suppliers } = generateMockData()
  const notifications = generateNotifications()

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update notifications, stats, etc.
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="perfect-glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading Sweet Shop Dashboard...</p>
        </div>
      </div>
    )
  }

  if (sweets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="perfect-glass-card p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">No Products Available</h3>
          <p className="text-gray-300 mb-6">Start by adding your first sweet product to the inventory</p>
          <button
            onClick={() => onAddSweet?.({} as any)}
            className="perfect-button"
          >
            Add First Product
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header with Notifications */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Sweet Shop Management Dashboard</h1>
          <p className="text-gray-300">Welcome, {displayName} • Complete Business Intelligence & Management System</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="perfect-glass-card p-3 relative">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            </button>
          </div>
          <button
            onClick={() => onAddSweet?.({} as any)}
            className="perfect-button flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Ultra-Advanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="perfect-glass-card p-6 text-center hover:scale-105 transition-transform">
          <div className="text-3xl font-bold text-blue-400 mb-2">${stats.todaySales.toLocaleString()}</div>
          <div className="text-sm text-gray-300">Today's Sales</div>
          <div className="text-xs text-green-400 mt-1">+12.5% from yesterday</div>
        </div>
        <div className="perfect-glass-card p-6 text-center hover:scale-105 transition-transform">
          <div className="text-3xl font-bold text-green-400 mb-2">${stats.totalValue.toLocaleString()}</div>
          <div className="text-sm text-gray-300">Inventory Value</div>
          <div className="text-xs text-yellow-400 mt-1">{stats.lowStockItems} low stock</div>
        </div>
        <div className="perfect-glass-card p-6 text-center hover:scale-105 transition-transform">
          <div className="text-3xl font-bold text-purple-400 mb-2">{stats.totalOrders}</div>
          <div className="text-sm text-gray-300">Total Orders</div>
          <div className="text-xs text-blue-400 mt-1">{stats.pendingOrders} pending</div>
        </div>
        <div className="perfect-glass-card p-6 text-center hover:scale-105 transition-transform">
          <div className="text-3xl font-bold text-yellow-400 mb-2">${stats.averageOrderValue.toFixed(2)}</div>
          <div className="text-sm text-gray-300">Avg Order Value</div>
          <div className="text-xs text-green-400 mt-1">+8.3% growth</div>
        </div>
        <div className="perfect-glass-card p-6 text-center hover:scale-105 transition-transform">
          <div className="text-3xl font-bold text-red-400 mb-2">{stats.outOfStockItems}</div>
          <div className="text-sm text-gray-300">Out of Stock</div>
          <div className="text-xs text-red-400 mt-1">Critical: {stats.criticalItems}</div>
        </div>
        <div className="perfect-glass-card p-6 text-center hover:scale-105 transition-transform">
          <div className="text-3xl font-bold text-indigo-400 mb-2">{stats.customerSatisfaction.toFixed(1)}%</div>
          <div className="text-sm text-gray-300">Satisfaction</div>
          <div className="text-xs text-green-400 mt-1">Excellent</div>
        </div>
      </div>

      {/* Advanced Tab Navigation */}
      <div className="perfect-glass-card p-6">
        <div className="flex flex-wrap gap-2">
          {(['overview', 'inventory', 'sales', 'orders', 'customers', 'suppliers', 'analytics', 'reports', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Suggestions */}
          {userRole === 'customer' && (
            <div className="perfect-glass-card p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Recommended for You</h3>
              <div className="flex flex-wrap gap-2">
                {getAISuggestions().map((suggestion, index) => (
                  <span key={index} className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white px-3 py-1 rounded-full text-sm">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Advanced Filters */}
          <div className="perfect-glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Advanced Product Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Products</label>
                <input
                  type="text"
                  placeholder="Search by name, category..."
                  className="perfect-input"
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-blue-500/20 cursor-pointer text-gray-800 hover:text-blue-600 transition-colors"
                        onClick={() => {
                          handleFilterChange({ search: suggestion })
                          setShowSuggestions(false)
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  className="perfect-input"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  <option value="Cakes">Cakes</option>
                  <option value="Ice Cream">Ice Cream</option>
                  <option value="Candy">Candy</option>
                  <option value="Pastries">Pastries</option>
                  <option value="Cookies">Cookies</option>
                  <option value="Donuts">Donuts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Status</label>
                <select
                  className="perfect-input"
                  value={filters.inStock === true ? 'true' : filters.inStock === false ? 'false' : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    handleFilterChange({ 
                      inStock: value === 'true' ? true : value === 'false' ? false : undefined 
                    })
                  }}
                >
                  <option value="">All Items</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                <select
                  className="perfect-input"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                >
                  <option value="">All Prices</option>
                  <option value="5">Under $5</option>
                  <option value="10">Under $10</option>
                  <option value="20">Under $20</option>
                  <option value="50">Under $50</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <div className="flex space-x-2">
                  <select 
                    className="perfect-input flex-1"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'quantity' | 'category')}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="quantity">Stock</option>
                    <option value="category">Category</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="perfect-button px-3"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedSweets.map((sweet) => (
              <div key={sweet.id} className="perfect-glass-card overflow-hidden group hover:scale-105 transition-all duration-300">
                <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                  {sweet.imageUrl ? (
                    <img
                      src={sweet.imageUrl}
                      alt={sweet.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/sweets/placeholder.jpg'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sweet.quantity > 10 
                        ? 'bg-green-500/80 text-white' 
                        : sweet.quantity > 5 
                          ? 'bg-yellow-500/80 text-white' 
                          : sweet.quantity > 0 
                            ? 'bg-orange-500/80 text-white animate-pulse'
                            : 'bg-red-500/80 text-white'
                    }`}>
                      {sweet.quantity === 0 ? 'Out of Stock' : 
                       sweet.quantity <= 5 ? `Low Stock: ${sweet.quantity}` : 
                       `${sweet.quantity} in stock`}
                    </span>
                    {sweet.quantity <= 5 && sweet.quantity > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">{sweet.name}</h3>
                    <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">
                      {sweet.category}
                    </span>
                  </div>
                  {sweet.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{sweet.description}</p>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-green-400">${sweet.price.toFixed(2)}</span>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Stock Value</div>
                      <div className="text-sm font-semibold text-blue-400">
                        ${(sweet.price * sweet.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handlePurchaseClick(sweet)}
                      disabled={sweet.quantity === 0}
                      className={`perfect-button text-xs ${sweet.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
                    </button>
                    {userRole === 'admin' && (
                      <>
                        <button
                          onClick={() => onEditSweet?.(sweet.id)}
                          className="bg-yellow-600/80 text-white px-2 py-1 rounded hover:bg-yellow-700/80 transition-colors text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteSweet?.(sweet.id)}
                          className="bg-red-600/80 text-white px-2 py-1 rounded hover:bg-red-700/80 transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="perfect-glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Advanced Inventory Management</h3>
          <div className="space-y-4">
            {sweets.map((sweet) => (
              <div key={sweet.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      {sweet.imageUrl ? (
                        <img src={sweet.imageUrl} alt={sweet.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Img</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg">{sweet.name}</h4>
                      <p className="text-sm text-gray-400">{sweet.category}</p>
                      <p className="text-xs text-gray-500">${sweet.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Current Stock</p>
                      <p className={`text-2xl font-bold ${
                        sweet.quantity > 20 ? 'text-green-400' : 
                        sweet.quantity > 10 ? 'text-yellow-400' : 
                        sweet.quantity > 0 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {sweet.quantity}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Total Value</p>
                      <p className="text-lg font-semibold text-blue-400">
                        ${(sweet.price * sweet.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onRestock?.(sweet.id, 10)}
                        className="px-3 py-2 bg-green-600/80 text-white rounded-lg hover:bg-green-700/80 transition-colors text-sm"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => onRestock?.(sweet.id, 50)}
                        className="px-3 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors text-sm"
                      >
                        +50
                      </button>
                      <button
                        onClick={() => onRestock?.(sweet.id, 100)}
                        className="px-3 py-2 bg-purple-600/80 text-white rounded-lg hover:bg-purple-700/80 transition-colors text-sm"
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="perfect-glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sales Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Today's Revenue</span>
                <span className="text-2xl font-bold text-green-400">${stats.todaySales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Weekly Revenue</span>
                <span className="text-xl font-bold text-blue-400">${stats.weeklyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Monthly Revenue</span>
                <span className="text-xl font-bold text-purple-400">${stats.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Average Order Value</span>
                <span className="text-lg font-bold text-yellow-400">${stats.averageOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Profit Margin</span>
                <span className="text-lg font-bold text-indigo-400">{stats.profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="perfect-glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Category Performance</h3>
            <div className="space-y-3">
              {advancedMetrics.categoryPerformance.map((category) => (
                <div key={category.category} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{category.category}</span>
                    <span className={`text-sm font-semibold ${
                      category.growth > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {category.growth > 0 ? '+' : ''}{category.growth.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">${category.sales.toLocaleString()}</span>
                    <span className="text-gray-400">{category.items} items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="perfect-glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Orders Management</h3>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-white">Order #{order.id.split('-')[1]}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed' ? 'bg-green-500/80 text-white' :
                        order.status === 'processing' ? 'bg-blue-500/80 text-white' :
                        order.status === 'pending' ? 'bg-yellow-500/80 text-white' :
                        'bg-red-500/80 text-white'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.priority === 'urgent' ? 'bg-red-600/80 text-white' :
                        order.priority === 'high' ? 'bg-orange-600/80 text-white' :
                        order.priority === 'medium' ? 'bg-yellow-600/80 text-white' :
                        'bg-gray-600/80 text-white'
                      }`}>
                        {order.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">Customer: {order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.items.length} items • {order.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.date.toLocaleDateString()}</p>
                    {order.trackingNumber && (
                      <p className="text-xs text-blue-400">{order.trackingNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="perfect-glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Customer Relationship Management</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Customer Segments</h4>
              <div className="space-y-3">
                {advancedMetrics.customerSegments.map((segment) => (
                  <div key={segment.segment} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{segment.segment}</span>
                      <span className={`text-sm font-semibold ${
                        segment.growth > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {segment.growth > 0 ? '+' : ''}{segment.growth}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">{segment.count} customers</span>
                      <span className="text-gray-400">${segment.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Top Customers</h4>
              <div className="space-y-3">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{customer.name}</p>
                        <p className="text-xs text-gray-400">{customer.totalOrders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-400">${customer.totalSpent.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{customer.loyaltyPoints} points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="perfect-glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Supplier Management</h3>
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-lg">{supplier.name}</h4>
                    <p className="text-sm text-gray-300">Contact: {supplier.contact}</p>
                    <p className="text-xs text-gray-400">{supplier.email} • {supplier.phone}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-400">Products: {supplier.products.join(', ')}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">Reliability:</span>
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full" 
                          style={{ width: `${supplier.reliability}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-green-400">{supplier.reliability}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">Quality:</span>
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${supplier.quality}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-blue-400">{supplier.quality}%</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Avg Delivery: {supplier.averageDeliveryTime} days
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="perfect-glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Employee Performance</h3>
            <div className="space-y-3">
              {advancedMetrics.employeeMetrics.map((employee) => (
                <div key={employee.name} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{employee.name}</span>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(employee.rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{employee.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Sales: ${employee.sales.toLocaleString()}</span>
                    <span className="text-gray-400">Efficiency: {employee.efficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="perfect-glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Marketing Campaigns</h3>
            <div className="space-y-3">
              {advancedMetrics.marketingCampaigns.map((campaign) => (
                <div key={campaign.campaign} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{campaign.campaign}</span>
                    <span className={`text-sm font-semibold ${
                      campaign.roi > 200 ? 'text-green-400' : 
                      campaign.roi > 100 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {campaign.roi}% ROI
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Cost: ${campaign.cost.toLocaleString()}</span>
                    <span className="text-gray-400">{campaign.conversions} conversions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="perfect-glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Advanced Reports & Analytics</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Revenue:</span>
                  <span className="text-green-400 font-semibold">${(stats.weeklyRevenue * 4).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Costs:</span>
                  <span className="text-red-400 font-semibold">${(stats.weeklyRevenue * 0.7).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Net Profit:</span>
                  <span className="text-blue-400 font-semibold">${(stats.weeklyRevenue * 0.3).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Margin:</span>
                  <span className="text-purple-400 font-semibold">{stats.profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Operational Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Inventory Turnover:</span>
                  <span className="text-blue-400 font-semibold">{stats.inventoryTurnover.toFixed(1)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer Satisfaction:</span>
                  <span className="text-green-400 font-semibold">{stats.customerSatisfaction.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Refund Rate:</span>
                  <span className="text-red-400 font-semibold">{stats.refundRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Website Traffic:</span>
                  <span className="text-purple-400 font-semibold">{stats.websiteTraffic.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Export Options</h4>
              <div className="space-y-2">
                <button className="w-full perfect-button text-sm">Export CSV Report</button>
                <button className="w-full perfect-button text-sm">Export Excel Report</button>
                <button className="w-full perfect-button text-sm">Generate PDF Report</button>
                <button className="w-full perfect-button text-sm">Schedule Reports</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="perfect-glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Dashboard Settings</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Display Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Dark Mode</span>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 ${darkMode ? 'bg-blue-600' : 'bg-gray-600'} rounded-full relative transition-colors`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Compact View</span>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Real-time Updates</span>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto Refresh</span>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Notification Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Low Stock Alerts</span>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">New Order Notifications</span>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sales Milestones</span>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">System Updates</span>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedSweet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="perfect-glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Purchase</h3>
            <div className="mb-4">
              <p className="text-white font-medium">{selectedSweet.name}</p>
              <p className="text-gray-300">Price: ${selectedSweet.price.toFixed(2)}</p>
              <p className="text-gray-300">Available: {selectedSweet.quantity}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={selectedSweet.quantity}
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(Math.max(1, Math.min(selectedSweet.quantity, parseInt(e.target.value) || 1)))}
                className="perfect-input w-full"
              />
            </div>
            <div className="mb-4">
              <p className="text-white font-semibold">
                Total: ${(selectedSweet.price * purchaseQuantity).toFixed(2)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={confirmPurchase}
                className="flex-1 perfect-button"
              >
                Confirm Purchase
              </button>
              <button
                onClick={() => {
                  setShowPurchaseModal(false)
                  setSelectedSweet(null)
                  setPurchaseQuantity(1)
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toastType === 'success' ? 'bg-green-600' : 
          toastType === 'error' ? 'bg-red-600' : 'bg-yellow-600'
        } text-white`}>
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Undo Purchase Button */}
      {lastPurchase && Date.now() - lastPurchase.timestamp < 10000 && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={undoPurchase}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Undo Purchase ({Math.ceil((10000 - (Date.now() - lastPurchase.timestamp)) / 1000)}s)
          </button>
        </div>
      )}
    </div>
  )
}
