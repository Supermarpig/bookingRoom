import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: "USER" | "ADMIN"
  }

  interface Session extends DefaultSession {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN"
  }
} 