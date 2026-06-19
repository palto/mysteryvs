import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

/** Name of the signed session cookie. */
export const SESSION_COOKIE = "session";

/** Lifetime of an authenticated session, in seconds (30 days). */
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30;

/** Lifetime of an anonymous (pre-login) session, in seconds (1 year). */
export const ANONYMOUS_SESSION_MAX_AGE_S = 60 * 60 * 24 * 365;

export function sessionCookieOptions(maxAgeS: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeS,
  };
}

export interface Session {
  uid: string;
  username?: string;
}

/**
 * Creates a signed (HS256) JWT for the given session. The payload is
 * base64url-encoded and therefore readable, but the HMAC signature ensures it
 * cannot be altered without the server secret.
 */
export async function createSessionToken(
  session: Session,
  maxAgeS: number,
): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeS}s`)
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
