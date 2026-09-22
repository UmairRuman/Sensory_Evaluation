import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "VIEWER";
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "VIEWER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "VIEWER";
  }
}
