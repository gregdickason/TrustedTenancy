import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    uid: string
    role?: string | null
  }
}