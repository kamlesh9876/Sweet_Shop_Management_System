import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from './Dashboard'
import type { Sweet } from '../types/sweet'

describe('Dashboard', () => {
  const mockSweets: Sweet[] = [
    {
      id: '1',
      name: 'Chocolate Cake',
      category: 'Cakes',
      price: 12.99,
      quantity: 10,
      description: 'Delicious chocolate cake'
    },
    {
      id: '2',
      name: 'Vanilla Ice Cream',
      category: 'Ice Cream',
      price: 5.99,
      quantity: 0,
      description: 'Creamy vanilla ice cream'
    }
  ]

  it('should render dashboard with sweets list', () => {
    render(<Dashboard sweets={mockSweets} />)
    
    expect(screen.getByText(/sweet shop dashboard/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /chocolate cake/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /vanilla ice cream/i })).toBeInTheDocument()
  })

  it('should display loading state when loading', () => {
    render(<Dashboard sweets={[]} isLoading={true} />)
    
    expect(screen.getByText(/loading sweets/i)).toBeInTheDocument()
  })

  it('should display empty state when no sweets', () => {
    render(<Dashboard sweets={[]} />)
    
    expect(screen.getByText(/no sweets available/i)).toBeInTheDocument()
  })

  it('should filter sweets by category', async () => {
    const onFilterChange = vi.fn()
    render(<Dashboard sweets={mockSweets} onFilterChange={onFilterChange} />)
    
    const categoryFilter = screen.getByLabelText(/category/i)
    fireEvent.change(categoryFilter, { target: { value: 'Cakes' } })
    
    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({ category: 'Cakes' })
    })
  })

  it('should filter sweets by search term', async () => {
    const onFilterChange = vi.fn()
    render(<Dashboard sweets={mockSweets} onFilterChange={onFilterChange} />)
    
    const searchInput = screen.getByPlaceholderText(/search sweets/i)
    fireEvent.change(searchInput, { target: { value: 'chocolate' } })
    
    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({ search: 'chocolate' })
    })
  })

  it('should call onPurchase when purchase button is clicked', async () => {
    const onPurchase = vi.fn()
    render(<Dashboard sweets={mockSweets} onPurchase={onPurchase} />)
    
    const purchaseButton = screen.getByRole('button', { name: /purchase chocolate cake/i })
    fireEvent.click(purchaseButton)
    
    await waitFor(() => {
      expect(onPurchase).toHaveBeenCalledWith('1')
    })
  })

  it('should disable purchase button when quantity is zero', () => {
    render(<Dashboard sweets={mockSweets} />)
    
    const purchaseButton = screen.getByRole('button', { name: /out of stock/i })
    expect(purchaseButton).toBeDisabled()
  })

  it('should display price and quantity correctly', () => {
    render(<Dashboard sweets={mockSweets} />)
    
    expect(screen.getByText(/\$12\.99/i)).toBeInTheDocument()
    expect(screen.getByText(/10 in stock/i)).toBeInTheDocument()
    
    // More specific selector for out of stock in the product card
    const outOfStockElements = screen.getAllByText(/out of stock/i)
    expect(outOfStockElements.length).toBeGreaterThan(0)
  })
})
