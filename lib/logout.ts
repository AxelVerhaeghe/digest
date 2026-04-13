import { resetApi } from "@/api";
import { resetLocalData } from "@/db/reset";
import { clearCredentials } from "@/lib/credentials";

export async function logout(): Promise<void> {
  await clearCredentials();
  await resetLocalData();
  resetApi();
}
