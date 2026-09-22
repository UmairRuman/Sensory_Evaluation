"use server";

import { getCategoryMasterfile } from "@/lib/masterfile/queries";

export async function fetchCategoryMasterfile(categoryId: string) {
  return getCategoryMasterfile(categoryId);
}
