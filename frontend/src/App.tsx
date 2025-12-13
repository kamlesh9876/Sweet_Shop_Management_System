import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import AdminDashboard from './components/AdminDashboard'
import EmployeeDashboard from './components/EmployeeDashboard'
import type { Sweet } from './types/sweet'
import { authAPI, sweetsAPI } from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login')
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Check authentication state on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        setCurrentUser(JSON.parse(user))
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Load sweets from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSweets()
    }
  }, [isAuthenticated])

  // Debug: Monitor sweets changes
  useEffect(() => {
    console.log('Sweets array changed:', sweets)
    console.log('Current sweets count:', sweets.length)
  }, [sweets])

  const loadSweets = async () => {
    try {
      setLoading(true)
      console.log('Loading sweets from API...')
      const data = await sweetsAPI.getAll()
      console.log('Sweets loaded from API:', data)
      console.log('Number of sweets:', data.length)
      setSweets(data)
      console.log('Sweets state updated')
    } catch (error) {
      console.error('Failed to load sweets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true)
      const response = await authAPI.login(credentials.email, credentials.password)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setCurrentUser(response.user)
      setIsAuthenticated(true)
    } catch (error: any) {
      console.error('Login failed:', error)
      alert(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (credentials: { email: string; password: string; confirmPassword: string; name: string; role: 'admin' | 'employee'; }) => {
    try {
      setLoading(true)
      const response = await authAPI.register(credentials.name, credentials.email, credentials.password, credentials.role)
      localStorage.setItem('token', response.token)
      setCurrentUser(response.user)
      setIsAuthenticated(true)
    } catch (error: any) {
      console.error('Register failed:', error)
      alert(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentUser(null)
    setSweets([])
    setCurrentView('login')
  }

  const handleRestock = async (sweetId: string, quantity: number) => {
    try {
      await sweetsAPI.restock(sweetId, quantity)
      await loadSweets()
      alert('Sweet restocked successfully!')
    } catch (error: any) {
      console.error('Restock failed:', error)
      alert(error.response?.data?.error || 'Restock failed')
    }
  }

  const handleSweetsUpdate = async () => {
    console.log('Refreshing sweets data...')
    await loadSweets()
  }

  // If authenticated, show dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
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
          
          {currentUser?.role === 'admin' ? (
            <AdminDashboard 
              sweets={sweets}
              currentUser={currentUser}
              loading={loading}
              onSweetsUpdate={handleSweetsUpdate}
            />
          ) : (
            <EmployeeDashboard 
              sweets={sweets}
              onRestock={handleRestock}
              currentUser={currentUser}
              loading={loading}
            />
          )}
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
                <LoginForm onSubmit={handleLogin} isLoading={loading} />
              )}
              
              {currentView === 'register' && (
                <RegisterForm onSubmit={handleRegister} isLoading={loading} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
