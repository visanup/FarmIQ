-- Check all tables in analytics schema
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'analytics' 
ORDER BY tablename;
