TRUNCATE TABLE auth.password_reset_tokens, auth.verification_tokens, auth.refresh_tokens, auth.users RESTART IDENTITY CASCADE;

