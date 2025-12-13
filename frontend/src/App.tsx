import { useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Dashboard from './components/Dashboard'
import type { Sweet, SweetFilters } from './types/sweet'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login')

  // Mock data for demonstration
  const mockSweets: Sweet[] = [
    {
      id: '1',
      name: 'Birthday Cake',
      category: 'Cakes',
      price: 12.99,
      quantity: 10,
      description: 'Delicious birthday cake with layers of cream',
      imageUrl: '/images/sweets/Birthday cake-pana.png'
    },
    {
      id: '2',
      name: 'Sweet Choice',
      category: 'Candy',
      price: 5.99,
      quantity: 0,
      description: 'Assorted sweet treats',
      imageUrl: '/images/sweets/Choice-pana.png'
    },
    {
      id: '3',
      name: 'Chocolate Donut',
      category: 'Donuts',
      price: 3.99,
      quantity: 3,
      description: 'Glazed chocolate donut with sprinkles',
      imageUrl: '/images/sweets/Choice-pana.png'
    },
    {
      id: '4',
      name: 'Vanilla Ice Cream',
      category: 'Ice Cream',
      price: 4.99,
      quantity: 15,
      description: 'Creamy vanilla ice cream',
      imageUrl: '/images/sweets/Choice-pana.png'
    },
    {
      id: '5',
      name: 'Strawberry Pastry',
      category: 'Pastries',
      price: 6.99,
      quantity: 2,
      description: 'Fresh strawberry pastry with cream',
      imageUrl: '/images/sweets/Eating healthy food-rafiki.png'
    },
    {
      id: '6',
      name: 'Chocolate Chip Cookie',
      category: 'Cookies',
      price: 2.99,
      quantity: 20,
      description: 'Warm chocolate chip cookies',
      imageUrl: '/images/sweets/Choice-pana.png'
    },
    {
      id: '7',
      name: 'Red Velvet Cake',
      category: 'Cakes',
      price: 15.99,
      quantity: 8,
      description: 'Classic red velvet cake with cream cheese frosting',
      imageUrl: '/images/sweets/Birthday cake-pana.png'
    },
    {
      id: '8',
      name: 'Gummy Bears',
      category: 'Candy',
      price: 1.99,
      quantity: 50,
      description: 'Colorful gummy bear candies',
      imageUrl: '/images/sweets/Choice-pana.png'
    }
  ]

  const handleLogin = (credentials: { email: string; password: string }) => {
    console.log('Login:', credentials)
    setIsAuthenticated(true)
  }

  const handleRegister = (credentials: { email: string; password: string; confirmPassword: string }) => {
    console.log('Register:', credentials)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentView('login')
  }

  const handlePurchase = (sweetId: string) => {
    console.log('Purchase:', sweetId)
  }

  const handleFilterChange = (filters: SweetFilters) => {
    console.log('Filter:', filters)
  }

  const handleEditSweet = (sweetId: string) => {
    console.log('Edit sweet:', sweetId)
  }

  const handleDeleteSweet = (sweetId: string) => {
    console.log('Delete sweet:', sweetId)
  }

  const handleRestock = (sweetId: string, quantity: number) => {
    console.log('Restock sweet:', sweetId, quantity)
  }

  const handleAddSweet = (sweet: Omit<Sweet, 'id'>) => {
    console.log('Add sweet:', sweet)
  }

  // If authenticated, show dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="header-title">
              Sweet Shop Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="gradient-button"
            >
              Logout
            </button>
          </div>
          
          <Dashboard 
            sweets={mockSweets}
            onPurchase={handlePurchase}
            onFilterChange={handleFilterChange}
            onEditSweet={handleEditSweet}
            onDeleteSweet={handleDeleteSweet}
            onRestock={handleRestock}
            onAddSweet={handleAddSweet}
            userRole="admin"
            currentUser={{ id: '1', name: 'Admin User', email: 'admin@sweetshop.com' }}
          />
        </div>
      </div>
    )
  }

  // If not authenticated, show login/register forms
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          src="/images/sweets/7021063_Eating_Muffins_4096x2160.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        />
        {/* Dark overlay for better form visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60"></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left side - Flip images */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="relative z-0 flex items-center justify-center w-full h-full p-8">
            <div className="image-flip-container">
              <div className={`flip-card ${currentView === 'register' ? 'flipped' : ''}`}>
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <img
                      src="/images/sweets/Choice-pana.png"
                      alt="Login Choice"
                      className="flip-image"
                    />
                  </div>
                  <div className="flip-card-back">
                    <img
                      src="/images/sweets/Eating healthy food-rafiki.png"
                      alt="Register Healthy Food"
                      className="flip-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Forms with perfect glass effect */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full animate-bounce-in">
            <div className="perfect-glass-card p-8 mb-6 text-center perfect-hover-lift">
              <h1 className="perfect-title mb-2">
                Sweet Shop
              </h1>
              <p className="text-gray-200 text-lg">
                Management System
              </p>
              {/* Add floating particles */}
              <div className="perfect-particles">
                <div className="perfect-particle" style={{width: '4px', height: '4px', top: '20%', left: '10%', animationDelay: '0s'}}></div>
                <div className="perfect-particle" style={{width: '3px', height: '3px', top: '60%', left: '80%', animationDelay: '2s'}}></div>
                <div className="perfect-particle" style={{width: '5px', height: '5px', top: '40%', left: '60%', animationDelay: '4s'}}></div>
                <div className="perfect-particle" style={{width: '2px', height: '2px', top: '80%', left: '30%', animationDelay: '6s'}}></div>
              </div>
            </div>
            
            {/* Perfect Navigation */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setCurrentView('login')}
                className={`perfect-nav-button ${currentView === 'login' ? 'active' : 'inactive'}`}
              >
                Login
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className={`perfect-nav-button ${currentView === 'register' ? 'active' : 'inactive'}`}
              >
                Register
              </button>
            </div>

            {/* Perfect Content */}
            <div className="perfect-glass-card p-8 animate-fade-in-up perfect-hover-lift">
              {currentView === 'login' && (
                <LoginForm onSubmit={handleLogin} />
              )}
              
              {currentView === 'register' && (
                <RegisterForm onSubmit={handleRegister} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
