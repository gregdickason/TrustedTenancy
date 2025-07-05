import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './db'
import type { NextAuthOptions } from 'next-auth'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db.$),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
        session.user.role = token.role || null
      }
      return session
    },
    jwt: async ({ user, token }: { user?: any; token: JWT }) => {
      if (user) {
        token.uid = user.id
        token.role = user.role
      }
      return token
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
  },
}