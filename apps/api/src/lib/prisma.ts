// Prisma Client initialization for Utsav API
// Provides database access throughout the application

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Use globalThis to prevent multiple instances during hot reloading in development
export const prisma = globalThis.prisma ?? prismaClientSingleton();

// Assign to global in development to prevent connection issues on hot reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;