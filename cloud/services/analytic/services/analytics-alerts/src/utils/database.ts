// src/utils/database.ts
import { AppDataSource } from '../database';

/**
 * Initialize database connection
 */
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};