import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPassword from './ResetPassword';

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

describe('ResetPassword page', () => {
  const setup = (token = 'test-token') => {
    window.history.pushState({}, '', `/auth/reset-password?token=${token}`);
    return render(
      <MemoryRouter initialEntries={[`/auth/reset-password?token=${token}`]}>
        <Routes>
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/signin" element={<div>Sign In Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with a valid token', () => {
    setup();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeDisabled();
  });

  it('shows validation error when passwords do not match', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits and redirects on success', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ message: 'Password updated successfully' }) });
    setup();
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'password123' } });
    const button = screen.getByRole('button', { name: /update password/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(await screen.findByText(/password changed!/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/sign in page/i)).toBeInTheDocument(), { timeout: 3000 });
  });

  it('shows error on API failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Token expired' }) });
    setup();
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/token expired/i)).toBeInTheDocument();
  });
});