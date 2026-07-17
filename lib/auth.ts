import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "./session";
export { hashPassword, verifyPassword } from "./session";

export async function setSession(usuario: string) {
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(usuario), {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.AUTH_SECURE_COOKIE === "true"
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
