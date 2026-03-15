// frontend/__tests__/components/Assessment.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Assessment } from '@/components/Assessment';

describe('Assessment', () => {
  it('renders all 4 pillar questions', () => {
    render(<Assessment />);
    expect(screen.getByText('What does your week look like?')).toBeInTheDocument();
    expect(screen.getByText("When you do train, what's it actually like?")).toBeInTheDocument();
    expect(screen.getByText("What's your protein situation?")).toBeInTheDocument();
    expect(screen.getByText("What's 6am feel like?")).toBeInTheDocument();
  });

  it('shows result after all questions answered', () => {
    render(<Assessment />);

    // Answer all 4 questions with first option (score 1 each)
    fireEvent.click(screen.getByText("I haven't trained in months (or ever)"));
    fireEvent.click(screen.getByText('I scroll my phone between sets and leave dry'));
    fireEvent.click(screen.getByText("Protein what? I couldn't tell you how many grams"));
    fireEvent.click(screen.getByText("I didn't sleep, or slept 4 hours doom-scrolling"));

    // C wins tie at score 1 (CIDS order)
    expect(screen.getByText(/Your priority: Consistency/)).toBeInTheDocument();
  });

  it('highlights the correct weakest pillar', () => {
    render(<Assessment />);

    // C=4, I=1, D=4, S=4 => Intensity is weakest
    fireEvent.click(screen.getByText('I show up like clockwork, no excuses'));
    fireEvent.click(screen.getByText('I scroll my phone between sets and leave dry'));
    fireEvent.click(screen.getByText('I track my macros and eat to fuel my training'));
    fireEvent.click(screen.getByText('Eyes open before the alarm, ready to go'));

    expect(screen.getByText(/Your priority: Intensity/)).toBeInTheDocument();
  });
});
