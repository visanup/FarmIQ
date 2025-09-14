import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '../configs/config';

// Instantiate Prisma with explicit datasource URL for clarity in edge services
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});


