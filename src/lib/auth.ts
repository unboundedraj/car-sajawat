import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // The expiry check reads the clock, so it must run at request time (Cache Components)
  await connection();
  return verifySessionToken(token);
}

/** Use in every admin page and Server Action. The proxy alone is not enough. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
