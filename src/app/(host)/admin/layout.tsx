import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Host layout already confirms a session exists; this additionally restricts admin-only
  // master-data management (Changes 1-3) to the ADMIN role specifically, per the CR's access
  // control requirement — Viewers should never reach these screens, even by direct URL.
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
