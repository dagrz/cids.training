// frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface SignupPayload {
  email: string;
  phone: string;
  countryCode: string;
  assessmentResult?: Record<string, number>;
}

export async function submitSignup(payload: SignupPayload): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Signup failed');
  }

  return response.json();
}
