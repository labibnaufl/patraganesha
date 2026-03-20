import { PrismaClient } from "./generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add connection_limit=1 and pool_timeout for shared hosting environments
// This prevents exhausting OS-level timers and file descriptors on Hostinger
function buildDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? ''
  if (!url) return url
  const separator = url.includes('?') ? '&' : '?'
  // Only add if not already set
  if (url.includes('connection_limit')) return url
  return `${url}${separator}connection_limit=1&pool_timeout=10`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      }
    }
  })

// Always cache globally — in production, prevents re-instantiation
// In development, prevents hot-reload from creating multiple instances
globalForPrisma.prisma = prisma