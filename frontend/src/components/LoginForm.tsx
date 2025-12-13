import React, { useState, useEffect } from 'react'
import type { LoginCredentials } from '../types/auth'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void
  isLoading?: boolean
  error?: string
}

export default function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = validateForm()
    if (isValid) {
      onSubmit(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Debug: log validation errors state
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors state:', validationErrors)
    }
  }, [validationErrors])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="perfect-form-group">
        <label htmlFor="email" className="block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`perfect-input ${validationErrors.email ? 'perfect-error' : ''}`}
          disabled={isLoading}
          placeholder="Enter your email"
        />
        {validationErrors.email && (
          <p className="text-red-400 text-sm font-medium bg-red-500/10 backdrop-blur-sm px-3 py-2 rounded-md border border-red-400/30 animate-fade-in-up" data-testid="email-error">
            {validationErrors.email}
          </p>
        )}
      </div>

      <div className="perfect-form-group">
        <label htmlFor="password" className="block text-sm font-medium text-white/80">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`perfect-input pr-10 ${validationErrors.password ? 'perfect-error' : ''}`}
            disabled={isLoading}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-red-400 text-sm font-medium bg-red-500/10 backdrop-blur-sm px-3 py-2 rounded-md border border-red-400/30 animate-fade-in-up" data-testid="password-error">
            {validationErrors.password}
          </p>
        )}
      </div>

      {error && (
        <div className="perfect-error rounded-md p-4 animate-fade-in-up">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="perfect-button w-full perfect-hover-lift"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="perfect-spinner mr-2"></span>
            <span className="mr-1">Login</span>
            <span className="text-white/80">logging in...</span>
          </span>
        ) : (
          'Login'
        )}
      </button>
    </form>
  )
}
