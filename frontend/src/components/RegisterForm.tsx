import React, { useState } from 'react'
import type { RegisterCredentials } from '../types/auth'

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => void
  isLoading?: boolean
  error?: string
}

export default function RegisterForm({ onSubmit, isLoading = false, error }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterCredentials>({
    email: '',
    password: '',
    confirmPassword: ''
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
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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

      <div className="perfect-form-group">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`perfect-input ${validationErrors.confirmPassword ? 'perfect-error' : ''}`}
          disabled={isLoading}
          placeholder="Confirm your password"
        />
        {validationErrors.confirmPassword && (
          <p className="text-red-400 text-sm font-medium bg-red-500/10 backdrop-blur-sm px-3 py-2 rounded-md border border-red-400/30 animate-fade-in-up" data-testid="confirm-password-error">
            {validationErrors.confirmPassword}
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
            <span className="text-white/80">Registering...</span>
          </span>
        ) : (
          'Register'
        )}
      </button>
    </form>
  )
}
