"use server";

import { auth } from "@/lib/auth";
import { fetchProductRemarks } from "@/lib/scoring/remarks";

export async function getProductRemarks(sessionProductId: string) {
  const authSession = await auth();
  if (!authSession?.user) throw new Error("Unauthorized");

  return fetchProductRemarks(sessionProductId);
}
