import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

/** Name of the signed session cookie. */
export const SESSION_COOKIE = "session";

/** Session lifetime in seconds (1 year). */
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 365;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_S,
};

export interface Session {
  uid: string;
  username?: string;
}

/**
 * Creates a signed (HS256) JWT for the given session. The payload is
 * base64url-encoded and therefore readable, but the HMAC signature ensures it
 * cannot be altered without the server secret.
 */
export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_S}s`)
    .sign(secret);
}

/**
 * Verifies a session token's signature and expiry. Returns the decoded session
 * or `null` if the token is missing, tampered with, or expired.
 */
export async function verifySessionToken(
  token: string,
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      uid: payload.uid as string,
      username: payload.username as string | undefined,
    };
  } catch (err) {
    const code = err instanceof Error ? err.name : "unknown";
    console.warn(`Session verification failed: ${code}`);
    return null;
  }
}
