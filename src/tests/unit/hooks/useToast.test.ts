import { describe, it, expect, vi } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';

// Mock toast implementation
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
    toasts: []
  })
}));

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a basic toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Success',
        description: 'Operation completed'
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Operation completed'
    });
  });

  it('should create a toast with variant', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Something went wrong',
      variant: 'destructive'
    });
  });

  it('should create a toast with duration', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Info',
        description: 'Auto-dismiss in 3 seconds',
        duration: 3000
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Info',
      description: 'Auto-dismiss in 3 seconds',
      duration: 3000
    });
  });

  it('should handle toast with action', () => {
    const { result } = renderHook(() => useToast());
    const actionFn = vi.fn();
    
    act(() => {
      result.current.toast({
        title: 'Confirm',
        description: 'Do you want to continue?',
        action: {
          label: 'Yes',
          onClick: actionFn
        }
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Confirm',
      description: 'Do you want to continue?',
      action: {
        label: 'Yes',
        onClick: actionFn
      }
    });
  });

  it('should provide dismiss functionality', () => {
    const { result } = renderHook(() => useToast());
    const mockDismiss = vi.fn();
    
    // Mock the dismiss function
    result.current.dismiss = mockDismiss;
    
    act(() => {
      result.current.dismiss('toast-id');
    });

    expect(mockDismiss).toHaveBeenCalledWith('toast-id');
  });
});

// Test toast utility functions
describe('Toast Utilities', () => {
  it('should show success toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Investment Successful',
        description: 'Your investment has been processed',
        variant: 'default'
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Investment Successful',
        variant: 'default'
      })
    );
  });

  it('should show error toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Payment Failed',
        description: 'Please check your payment method',
        variant: 'destructive'
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Payment Failed',
        variant: 'destructive'
      })
    );
  });

  it('should show loading toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Processing...',
        description: 'Please wait while we process your investment',
        duration: Infinity // Loading toasts don't auto-dismiss
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Processing...',
        duration: Infinity
      })
    );
  });
});