-- สร้างฐานข้อมูล sensor_cloud_db ถ้ายังไม่มี
SELECT 'CREATE DATABASE sensor_cloud_db
  WITH OWNER = postgres
       TEMPLATE = template0
       ENCODING = ''UTF8''
       LC_COLLATE = ''en_US.utf8''
       LC_CTYPE   = ''en_US.utf8'''
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = 'sensor_cloud_db'
)\gexec
