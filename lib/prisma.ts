import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma'
import ws from 'ws'

// Required for Node.js (non-edge) environments:
// Neon serverless driver's WebSocket transport needs a native constructor
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  // Use DIRECT_URL — PrismaNeon is an HTTP/WebSocket adapter and does NOT go through PgBouncer.
  // DATABASE_URL has pgbouncer=true which drops WebSockets prematurely causing "Connection closed"
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!
  const adapter = new PrismaNeon({ connectionString })

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Add retry logic to handle Neon cold-start "Connection closed" errors.
  // Neon free tier suspends the DB after ~5 min of inactivity.
  // The first request wakes it up but may fail — retry up to 3 times.
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
              msg.includes('socket')

            if (attempt < MAX_RETRIES - 1 && isConnectionError) {
              // Wait before retrying: 500ms, 1500ms
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