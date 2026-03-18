// frontend/__tests__/components/Assessment.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Assessment } from '@/components/Assessment';

describe('Assessment', () => {
  it('renders first question', () => {
    render(<Assessment />);
    // The component shows "Consistency — What does your week look like?"
    // Check for the answer options which are always fully rendered
    expect(screen.getByText("I haven't trained in months (or ever)")).toBeInTheDocument();
  });

  it('shows result immediately when user scores weak on first question', async () => {
    render(<Assessment />);

    fireEvent.click(screen.getByText("I haven't trained in months (or ever)"));

    await waitFor(() => {
      expect(screen.getByText(/Your priority: Consistency/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('advances to next question when user scores strong', async () => {
    render(<Assessment />);

    fireEvent.click(screen.getByText('I show up like clockwork, no excuses'));

    await waitFor(() => {
      // Check for an intensity answer option (proves we moved to question 2)
      expect(screen.getByText('I scroll my phone between sets and leave dry')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
