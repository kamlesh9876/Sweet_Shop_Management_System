import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RegisterForm from './RegisterForm'

describe('RegisterForm', () => {
  it('should render registration form with all required fields', () => {
    render(<RegisterForm onSubmit={vi.fn()} />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('should show validation errors when form is submitted with empty fields', async () => {
    const mockSubmit = vi.fn()
    render(<RegisterForm onSubmit={mockSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /register/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument()
      expect(screen.getByTestId('password-error')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-password-error')).toBeInTheDocument()
    })
    
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('should show validation error when passwords do not match', async () => {
    const mockSubmit = vi.fn()
    render(<RegisterForm onSubmit={mockSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'different456' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('confirm-password-error')).toBeInTheDocument()
    })
    
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('should call onSubmit with form data when valid form is submitted', async () => {
    const mockSubmit = vi.fn()
    render(<RegisterForm onSubmit={mockSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
    })
  })

  it('should show loading state when isLoading is true', () => {
    render(<RegisterForm onSubmit={vi.fn()} isLoading={true} />)
    
    const submitButton = screen.getByRole('button', { name: /register/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/registering/i)).toBeInTheDocument()
  })

  it('should display error message when error prop is provided', () => {
    render(<RegisterForm onSubmit={vi.fn()} error="Registration failed" />)
    
    expect(screen.getByText('Registration failed')).toBeInTheDocument()
  })
})
