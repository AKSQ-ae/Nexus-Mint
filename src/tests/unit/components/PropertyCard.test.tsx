import { describe, it, expect, vi } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PropertyCard } from '@/components/properties/PropertyCard';

const mockProperty = {
  id: '1',
  title: 'Test Property',
  location: 'New York, NY',
  price: 1000000,
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1500,
  images: ['test-image.jpg'],
  price_per_token: 100,
  total_tokens: 10000,
  tokens_issued: 5000,
  funding_percentage: 50,
  estimated_annual_return: 8.5,
  min_investment: 100,
  is_featured: true,
  tokenization_active: true
};

describe('PropertyCard Component', () => {
  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    expect(screen.getByText('3 bed')).toBeInTheDocument();
    expect(screen.getByText('2 bath')).toBeInTheDocument();
    expect(screen.getByText('1,500 sqft')).toBeInTheDocument();
  });

  it('displays tokenization information', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('$100 per token')).toBeInTheDocument();
    expect(screen.getByText('50% funded')).toBeInTheDocument();
    expect(screen.getByText('8.5% return')).toBeInTheDocument();
  });

  it('shows featured badge when property is featured', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const onClickMock = vi.fn();
    render(<PropertyCard property={mockProperty} onClick={onClickMock} />);
    
    fireEvent.click(screen.getByTestId('property-card'));
    expect(onClickMock).toHaveBeenCalledWith(mockProperty);
  });

  it('shows investment button when tokenization is active', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Invest Now')).toBeInTheDocument();
  });

  it('disables investment when tokenization is inactive', () => {
    const inactiveProperty = { ...mockProperty, tokenization_active: false };
    render(<PropertyCard property={inactiveProperty} />);
    
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    // Check that large numbers are formatted with commas
    expect(screen.getByText('$1,000,000')).toBeInTheDocument();
  });

  it('calculates funding percentage correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    // 5000 tokens issued out of 10000 total = 50%
    expect(screen.getByText('50% funded')).toBeInTheDocument();
  });

  it('handles missing optional properties gracefully', () => {
    const minimalProperty = {
      id: '2',
      title: 'Minimal Property',
      location: 'Test Location',
      price: 500000,
      price_per_token: 50,
      total_tokens: 10000,
      tokens_issued: 0,
      tokenization_active: false
    };

    render(<PropertyCard property={minimalProperty} />);
    
    expect(screen.getByText('Minimal Property')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('$500,000')).toBeInTheDocument();
  });
});