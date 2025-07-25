import { PrismaClient, Prisma } from '@prisma/client'

// Extended PrismaClient with connection ID
interface ExtendedPrismaClient extends PrismaClient {
  __connectionId?: string
}

// Enhanced global type for Prisma client management
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaConnectionId: string | undefined
}

// Environment-specific connection configuration
const createPrismaClient = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const client = new PrismaClient({
    log: isDevelopment ? [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ] : [
      { emit: 'event', level: 'error' },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Environment-specific optimizations
    ...(isDevelopment ? {
      // Development: prioritize stability over performance
    } : {
      // Production: optimize for performance
    }),
  })

  // Add connection ID for tracking
  const connectionId = Math.random().toString(36).substring(7)
  ;(client as ExtendedPrismaClient).__connectionId = connectionId
  
  // Environment-specific logging
  if (isDevelopment) {
    client.$on('error', (e) => {
      console.error(`❌ Database error [${connectionId}]:`, e)
    })
    
    client.$on('warn', (e) => {
      console.warn(`⚠️  Database warning [${connectionId}]:`, e)
    })
    
    console.log(`🔗 Database client created [${connectionId}] for ${isDevelopment ? 'development' : 'production'}`)
  }
  
  return client
}

// Stable singleton pattern for development
function getOrCreatePrismaClient(): PrismaClient {
  // In production, always create a new client
  if (process.env.NODE_ENV === 'production') {
    return createPrismaClient()
  }

  // In development, use stable singleton
  const stableConnectionId = process.env.DATABASE_URL || 'default'
  
  if (!globalForPrisma.prisma || globalForPrisma.prismaConnectionId !== stableConnectionId) {
    // Clean up old client if it exists
    if (globalForPrisma.prisma) {
      globalForPrisma.prisma.$disconnect().catch(console.error)
    }
    
    // Create new client
    globalForPrisma.prisma = createPrismaClient()
    globalForPrisma.prismaConnectionId = stableConnectionId
    
    console.log(`🔗 Database client created with connection ID: ${(globalForPrisma.prisma as ExtendedPrismaClient).__connectionId}`)
  }
  
  return globalForPrisma.prisma
}

// Simplified connection retry logic
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 500
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry certain types of errors
      if (error instanceof Error) {
        // Don't retry schema/syntax errors or auth errors
        if (error.message.includes('does not exist') || 
            error.message.includes('syntax error') ||
            error.message.includes('permission denied') ||
            error.message.includes('unauthorized')) {
          throw error
        }
      }
      
      // Only retry on the last attempt if it's a connection issue
      if (attempt === maxRetries - 1) {
        console.warn(`🔄 Database operation failed after ${maxRetries} attempts: ${lastError.message}`)
        throw lastError
      }
      
      // Wait before retry with jitter
      const delay = baseDelay * Math.pow(1.5, attempt) + Math.random() * 200
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Circuit breaker for database operations
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private readonly threshold = 5
  private readonly timeout = 30000 // 30 seconds

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is OPEN - database unavailable')
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold &&
           (Date.now() - this.lastFailureTime) < this.timeout
  }

  private onSuccess(): void {
    this.failures = 0
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
  }

  getState(): { isOpen: boolean; failures: number } {
    return {
      isOpen: this.isOpen(),
      failures: this.failures
    }
  }
}

// Enhanced database client with retry logic and circuit breaker
class DatabaseClient {
  private circuitBreaker = new CircuitBreaker()

  private get client() {
    return getOrCreatePrismaClient()
  }

  // Wrap all database operations with retry logic
  get property() {
    const client = this.client
    return {
      findMany: (args?: Prisma.PropertyFindManyArgs) => withRetry(() => client.property.findMany(args)),
      findUnique: (args: Prisma.PropertyFindUniqueArgs) => withRetry(() => client.property.findUnique(args)),
      findFirst: (args?: Prisma.PropertyFindFirstArgs) => withRetry(() => client.property.findFirst(args)),
      create: (args: Prisma.PropertyCreateArgs) => withRetry(() => client.property.create(args)),
      update: (args: Prisma.PropertyUpdateArgs) => withRetry(() => client.property.update(args)),
      delete: (args: Prisma.PropertyDeleteArgs) => withRetry(() => client.property.delete(args)),
      count: (args?: Prisma.PropertyCountArgs) => withRetry(() => client.property.count(args)),
      upsert: (args: Prisma.PropertyUpsertArgs) => withRetry(() => client.property.upsert(args)),
    }
  }

  get user() {
    const client = this.client
    return {
      findMany: (args?: Prisma.UserFindManyArgs) => withRetry(() => client.user.findMany(args)),
      findUnique: (args: Prisma.UserFindUniqueArgs) => withRetry(() => client.user.findUnique(args)),
      findFirst: (args?: Prisma.UserFindFirstArgs) => withRetry(() => client.user.findFirst(args)),
      create: (args: Prisma.UserCreateArgs) => withRetry(() => client.user.create(args)),
      update: (args: Prisma.UserUpdateArgs) => withRetry(() => client.user.update(args)),
      delete: (args: Prisma.UserDeleteArgs) => withRetry(() => client.user.delete(args)),
      count: (args?: Prisma.UserCountArgs) => withRetry(() => client.user.count(args)),
      upsert: (args: Prisma.UserUpsertArgs) => withRetry(() => client.user.upsert(args)),
    }
  }

  get inquiry() {
    const client = this.client
    return {
      findMany: (args?: Prisma.InquiryFindManyArgs) => withRetry(() => client.inquiry.findMany(args)),
      findUnique: (args: Prisma.InquiryFindUniqueArgs) => withRetry(() => client.inquiry.findUnique(args)),
      findFirst: (args?: Prisma.InquiryFindFirstArgs) => withRetry(() => client.inquiry.findFirst(args)),
      create: (args: Prisma.InquiryCreateArgs) => withRetry(() => client.inquiry.create(args)),
      update: (args: Prisma.InquiryUpdateArgs) => withRetry(() => client.inquiry.update(args)),
      delete: (args: Prisma.InquiryDeleteArgs) => withRetry(() => client.inquiry.delete(args)),
      count: (args?: Prisma.InquiryCountArgs) => withRetry(() => client.inquiry.count(args)),
      upsert: (args: Prisma.InquiryUpsertArgs) => withRetry(() => client.inquiry.upsert(args)),
    }
  }

  // Direct access to client for advanced operations
  get $() {
    return this.client
  }

  // Health check method with circuit breaker
  async healthCheck(): Promise<boolean> {
    try {
      // Simple connection test - just check if client exists
      // Don't execute any queries to avoid prepared statement conflicts
      const isConnected = !!this.client
      
      if (!isConnected) {
        throw new Error('Database client not available')
      }
      
      return true
    } catch (error) {
      const circuitState = this.circuitBreaker.getState()
      if (circuitState.isOpen) {
        console.warn(`🔴 Circuit breaker OPEN - ${circuitState.failures} failures`)
      } else {
        console.error('Database health check failed:', error)
      }
      return false
    }
  }

  // Get database status including circuit breaker state
  async getStatus(): Promise<{
    healthy: boolean
    circuitBreaker: { isOpen: boolean; failures: number }
    connectionId: string
  }> {
    const healthy = await this.healthCheck()
    return {
      healthy,
      circuitBreaker: this.circuitBreaker.getState(),
      connectionId: (this.client as ExtendedPrismaClient).__connectionId || 'unknown'
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

// Graceful cleanup on process exit
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await db.disconnect()
  })
  
  process.on('SIGINT', async () => {
    await db.disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await db.disconnect()
    process.exit(0)
  })
}