export const SESSION_COOKIE = "delicias_lia_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const SECRET = process.env.AUTH_SECRET || "delicias-lia-dev-secret";

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64urlToBytes(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function digest(value: string) {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export async function hashPassword(password: string, salt = crypto.randomUUID()) {
  return `sha256$${salt}$${await digest(`${salt}:${password}`)}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [, salt] = passwordHash.split("$");
  return (await hashPassword(password, salt)) === passwordHash;
}

export async function createSessionToken(usuario: string) {
  const payload = base64url(new TextEncoder().encode(JSON.stringify({ usuario, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })));
  return `${payload}.${await sign(payload)}`;
}

export async function isValidSessionToken(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || (await sign(payload)) !== signature) return false;

  try {
    const data = JSON.parse(new TextDecoder().decode(base64urlToBytes(payload))) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
