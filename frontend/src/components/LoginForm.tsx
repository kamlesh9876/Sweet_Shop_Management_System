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
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`perfect-input ${validationErrors.password ? 'perfect-error' : ''}`}
          disabled={isLoading}
          placeholder="Enter your password"
        />
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
