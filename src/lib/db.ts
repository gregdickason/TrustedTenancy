import { PrismaClient } from '@prisma/client'

// Enhanced global type for Prisma client management
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaConnectionId: string | undefined
}

// Connection configuration optimized for development
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

  // Add connection ID for tracking
  const connectionId = Math.random().toString(36).substring(7)
  ;(client as any).__connectionId = connectionId
  
  // Enhanced logging for development
  if (process.env.NODE_ENV === 'development') {
    client.$on('query', (e) => {
      console.log(`🔍 Query [${connectionId}]: ${e.query}`)
      if (e.duration > 1000) {
        console.warn(`⚠️  Slow query detected: ${e.duration}ms`)
      }
    })
    
    client.$on('error', (e) => {
      console.error(`❌ Database error [${connectionId}]:`, e)
    })
    
    client.$on('warn', (e) => {
      console.warn(`⚠️  Database warning [${connectionId}]:`, e)
    })
  }
  
  return client
}

// Enhanced singleton pattern for Turbopack compatibility
function getOrCreatePrismaClient(): PrismaClient {
  // In production, always create a new client
  if (process.env.NODE_ENV === 'production') {
    return createPrismaClient()
  }

  // In development, check if we need a new client
  const currentConnectionId = process.env.DATABASE_URL + Date.now().toString().slice(-6)
  
  if (!globalForPrisma.prisma || globalForPrisma.prismaConnectionId !== currentConnectionId) {
    // Clean up old client if it exists
    if (globalForPrisma.prisma) {
      globalForPrisma.prisma.$disconnect().catch(console.error)
    }
    
    // Create new client
    globalForPrisma.prisma = createPrismaClient()
    globalForPrisma.prismaConnectionId = currentConnectionId
  }
  
  return globalForPrisma.prisma
}

// Connection retry wrapper with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry certain types of errors
      if (error instanceof Error) {
        if (error.message.includes('prepared statement') && error.message.includes('already exists')) {
          // For prepared statement conflicts, wait and retry with a new client
          console.warn(`🔄 Prepared statement conflict detected, creating new client (attempt ${attempt + 1}/${maxRetries})`)
          
          // Force new client creation
          if (globalForPrisma.prisma) {
            await globalForPrisma.prisma.$disconnect().catch(() => {})
            globalForPrisma.prisma = undefined
            globalForPrisma.prismaConnectionId = undefined
          }
          
          // Wait with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // Don't retry schema/syntax errors
        if (error.message.includes('does not exist') || 
            error.message.includes('syntax error') ||
            error.message.includes('permission denied')) {
          throw error
        }
      }
      
      // Wait before retry
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Enhanced database client with retry logic
class DatabaseClient {
  private get client() {
    return getOrCreatePrismaClient()
  }

  // Wrap all database operations with retry logic
  get property() {
    const client = this.client
    return {
      findMany: (args?: any) => withRetry(() => client.property.findMany(args)),
      findUnique: (args: any) => withRetry(() => client.property.findUnique(args)),
      create: (args: any) => withRetry(() => client.property.create(args)),
      update: (args: any) => withRetry(() => client.property.update(args)),
      delete: (args: any) => withRetry(() => client.property.delete(args)),
      count: (args?: any) => withRetry(() => client.property.count(args)),
    }
  }

  get user() {
    const client = this.client
    return {
      findMany: (args?: any) => withRetry(() => client.user.findMany(args)),
      findUnique: (args: any) => withRetry(() => client.user.findUnique(args)),
      create: (args: any) => withRetry(() => client.user.create(args)),
      update: (args: any) => withRetry(() => client.user.update(args)),
      delete: (args: any) => withRetry(() => client.user.delete(args)),
      upsert: (args: any) => withRetry(() => client.user.upsert(args)),
    }
  }

  get inquiry() {
    const client = this.client
    return {
      findMany: (args?: any) => withRetry(() => client.inquiry.findMany(args)),
      findUnique: (args: any) => withRetry(() => client.inquiry.findUnique(args)),
      create: (args: any) => withRetry(() => client.inquiry.create(args)),
      update: (args: any) => withRetry(() => client.inquiry.update(args)),
      delete: (args: any) => withRetry(() => client.inquiry.delete(args)),
    }
  }

  // Direct access to client for advanced operations
  get $() {
    return this.client
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await withRetry(() => this.client.$queryRaw`SELECT 1`)
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }

  // Disconnect method
  async disconnect(): Promise<void> {
    if (globalForPrisma.prisma) {
      await globalForPrisma.prisma.$disconnect()
      globalForPrisma.prisma = undefined
      globalForPrisma.prismaConnectionId = undefined
    }
  }
}

export const db = new DatabaseClient()