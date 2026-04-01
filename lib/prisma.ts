import 'server-only'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma'
import ws from 'ws'

// Use WebSocket transport (PrismaNeon) instead of HTTP (PrismaNeonHttp).
// The HTTP adapter does NOT support transactions of any kind — including those
// triggered internally by Prisma for createMany, deleteMany, and nested writes.
// PrismaNeon (WebSocket) fully supports transactions and is required for
// any multi-step write operations (e.g. creating tags after an event/article).
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!

  const adapter = new PrismaNeon({ connectionString })

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Retry logic for Neon cold-start errors (free tier suspends after ~5 min)
  return client.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const MAX_RETRIES = 3
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            return await query(args)
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)

            const isConnectionError =
              msg.includes('Connection closed') ||
              msg.includes('connection') ||
              msg.includes('ECONNRESET') ||
              msg.includes('socket') ||
              msg.includes('503') ||
              msg.includes('timeout')

            if (attempt < MAX_RETRIES - 1 && isConnectionError) {
              await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
              continue
            }
            throw e
          }
        }
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
globalForPrisma.prisma = prisma