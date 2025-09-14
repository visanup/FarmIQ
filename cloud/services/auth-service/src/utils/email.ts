import { EMAIL_FROM, APP_BASE_URL } from '../configs/config';

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  // TODO: Integrate real email provider. For now, log to stdout.
  console.log(`[email] To: ${email}\nFrom: ${EMAIL_FROM}\nSubject: Verify your FarmIQ account\nBody: Click to verify: ${url}`);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  console.log(`[email] To: ${email}\nFrom: ${EMAIL_FROM}\nSubject: Reset your FarmIQ password\nBody: Reset link: ${url}`);
}

