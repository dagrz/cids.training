// frontend/src/components/SignupForm.tsx
'use client';

import { useState } from 'react';
import { submitSignup } from '@/lib/api';

interface SignupFormProps {
  assessmentResult?: Record<string, number>;
}

export function SignupForm({ assessmentResult }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timezone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await submitSignup({
        email,
        phone: phone.replace(/\D/g, ''),
        countryCode,
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
          Check your email for the CIDS Framework Guide. Your first nudge is coming tomorrow morning.
        </p>
      </section>
    );
  }

  return (
    <section id="signup" className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        Get Your Daily Nudge
      </h2>
      <p className="text-sm text-white/40 mb-5">
        One message a day. No spam. Just a reminder to Show Up, Push Hard, Eat Right, Rest Well.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="text"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-3.5 text-sm text-white outline-none w-20"
          >
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
            <option value="+91">+91</option>
          </select>
          <input
            type="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg py-3.5 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Start Now'}
        </button>
      </form>

      <p className="text-[11px] text-white/25 mt-2.5 text-center">
        Unsubscribe anytime. We respect your sleep — no messages after 9pm.
      </p>
    </section>
  );
}
