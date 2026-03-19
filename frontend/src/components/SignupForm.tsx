// frontend/src/components/SignupForm.tsx
'use client';

import { useState } from 'react';
import { submitSignup } from '@/lib/api';

interface SignupFormProps {
  assessmentResult?: Record<string, number>;
}

export function SignupForm({ assessmentResult }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [showTimezone, setShowTimezone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await submitSignup({
        email,
        phone: '',
        countryCode: '',
        timezone,
        assessmentResult,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section id="signup" className="px-4 py-8 border-t border-white/5 text-center">
        <div className="text-2xl font-extrabold mb-2">You&apos;re In 🤝</div>
        <p className="text-sm text-white/50">
          Check your email for your personalized CIDS guide. Your first weekly check-in arrives next Monday.
        </p>
      </section>
    );
  }

  return (
    <section id="signup" className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        Get Your Free CIDS Guide
      </h2>
      <p className="text-sm text-white/40 mb-4">
        The complete framework in one guide. Plus every week you get:
      </p>

      <ul className="text-sm text-white/50 mb-5 space-y-2">
        <li className="flex items-start gap-2">
          <span className="text-white/30 mt-0.5">→</span>
          <span>An accountability check-in to track your progress</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-white/30 mt-0.5">→</span>
          <span>Personalized advice based on where you are in CIDS</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-white/30 mt-0.5">→</span>
          <span>Early access to merch and gear deals</span>
        </li>
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="text"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />

        <div className="flex items-center justify-between text-xs text-white/30">
          <span>
            Timezone: {timezone.replace(/_/g, ' ')}
          </span>
          <button
            type="button"
            onClick={() => setShowTimezone(!showTimezone)}
            className="underline hover:text-white/50"
          >
            Change
          </button>
        </div>

        {showTimezone && (
          <input
            type="text"
            placeholder="e.g. America/New_York"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        )}

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg py-3.5 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Send Me The Guide'}
        </button>
      </form>

      <p className="text-[11px] text-white/25 mt-2.5 text-center">
        Unsubscribe anytime. No spam, ever.
      </p>
    </section>
  );
}
