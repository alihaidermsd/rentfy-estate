// This file is not needed for basic setup, but if you want it:
export const prismaConfig = {
  datasourceUrl: process.env.DATABASE_URL || 'file:./dev.db',
}