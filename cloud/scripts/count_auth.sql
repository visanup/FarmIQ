SELECT 'users' AS table_name, COUNT(*) AS row_count FROM auth.users
UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM auth.refresh_tokens
UNION ALL
SELECT 'verification_tokens', COUNT(*) FROM auth.verification_tokens
UNION ALL
SELECT 'password_reset_tokens', COUNT(*) FROM auth.password_reset_tokens;

