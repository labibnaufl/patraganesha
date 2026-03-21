import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // PrismaNeon uses Neon's HTTP transport (fetch-based, no binary engine, no WebSocket)
  // Works reliably on Node.js 18+ (native fetch) and shared hosting environments
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Cache globally to ensure a single instance across all requests
globalForPrisma.prisma = prisma