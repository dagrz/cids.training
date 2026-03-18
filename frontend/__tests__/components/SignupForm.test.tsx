// frontend/__tests__/components/SignupForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupForm } from '@/components/SignupForm';

describe('SignupForm', () => {
  it('renders email input and submit button', () => {
    render(<SignupForm />);
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send me the guide/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'notanemail' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send me the guide/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows success message after valid submission', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send me the guide/i }));

    await waitFor(() => {
      expect(screen.getByText(/you're in/i)).toBeInTheDocument();
    });
  });
});
