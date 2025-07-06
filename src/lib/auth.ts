import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { getServerSession } from 'next-auth/next'
import { db } from './db'
import { logger } from './logger'
import type { NextAuthOptions, User } from 'next-auth'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

// Check for required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  logger.auth('ERROR', 'Missing Google OAuth credentials', {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
  })
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db.$),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'missing-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing-client-secret',
    }),
  ],
  callbacks: {
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      try {
        logger.auth('DEBUG', 'Session callback triggered', { 
          hasSession: !!session, 
          hasToken: !!token, 
          tokenSub: token?.sub,
          sessionUserId: session?.user?.id 
        })
        
        if (session?.user && token?.sub) {
          session.user.id = token.sub
          session.user.role = token.role || null
          
          logger.auth('DEBUG', 'Session updated with user ID', { 
            userId: session.user.id, 
            userEmail: session.user.email,
            role: session.user.role 
          })
        }
        return session
      } catch (error) {
        logger.auth('ERROR', 'Session callback failed', { session, token }, error as Error)
        return session
      }
    },
    jwt: async ({ user, token }: { user?: User; token: JWT }) => {
      try {
        logger.auth('DEBUG', 'JWT callback triggered', { 
          hasUser: !!user, 
          hasToken: !!token, 
          userId: user?.id,
          userEmail: user?.email 
        })
        
        if (user) {
          token.uid = user.id
          token.role = user.role || null
          
          logger.auth('DEBUG', 'JWT token updated with user info', { 
            userId: user.id, 
            userEmail: user.email,
            role: user.role 
          })
        }
        return token
      } catch (error) {
        logger.auth('ERROR', 'JWT callback failed', { user, token }, error as Error)
        return token
      }
    },
    signIn: async ({ user, account }) => {
      try {
        logger.auth('INFO', 'Sign-in attempt started', { 
          userId: user?.id,
          userEmail: user?.email,
          provider: account?.provider,
          accountType: account?.type 
        })
        
        // Allow the sign-in to proceed
        return true
      } catch (error) {
        logger.auth('ERROR', 'Sign-in callback failed', { user, account }, error as Error)
        return false
      }
    },
  },
  events: {
    signIn: async ({ user, account, isNewUser }) => {
      logger.auth('INFO', 'User signed in successfully', {
        userId: user?.id,
        userEmail: user?.email,
        provider: account?.provider,
        isNewUser
      })
    },
    signOut: async ({ session, token }) => {
      logger.auth('INFO', 'User signed out', {
        userId: session?.user?.id || token?.sub,
        userEmail: session?.user?.email || token?.email
      })
    },
    createUser: async ({ user }) => {
      logger.auth('INFO', 'New user created', {
        userId: user.id,
        userEmail: user.email
      })
    },
  },
  logger: {
    error: (code, metadata) => {
      logger.auth('ERROR', `NextAuth error: ${code}`, metadata as Record<string, unknown>)
    },
    warn: (code) => {
      logger.auth('WARN', `NextAuth warning: ${code}`)
    },
    debug: (code, metadata) => {
      logger.auth('DEBUG', `NextAuth debug: ${code}`, metadata as Record<string, unknown>)
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
}

// Typed wrapper for getServerSession to eliminate type casting
export async function getTypedServerSession(): Promise<Session | null> {
  return await getServerSession(authOptions)
}