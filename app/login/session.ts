import { SignJWT, errors, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

/** Name of the signed session cookie. */
export const SESSION_COOKIE = "session";

/** Session lifetime in seconds (1 year). */
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 365;

/**
 * Schema version of the session payload, carried in a private `ver` claim.
 * Bump this whenever the payload shape changes incompatibly: tokens minted by
 * an older version fail verification and are reissued, so a deploy doesn't have
 * to understand every historical layout. Tokens from before this claim existed
 * have no `ver` and are likewise treated as outdated.
 */
export const SESSION_VERSION = 1;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_S,
};

export interface Session {
  /**
   * Stable, server-issued user id. Stored in the JWT's registered `sub`
   * (subject) claim — the standard place for the principal a token identifies.
   */
  sub: string;
  /** Freely-chosen player name. A custom claim, set on login. */
  username?: string;
}

/**
 * Creates a signed (HS256) JWT for the given session. A fresh `sub` is
 * generated when one isn't supplied, so callers never have to mint it
 * themselves. The payload is base64url-encoded and therefore readable, but the
 * HMAC signature ensures it cannot be altered without the server secret.
 */
export async function createSessionToken(
  session: Partial<Session> = {},
): Promise<string> {
  return new SignJWT({ ver: SESSION_VERSION, username: session.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub ?? crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_S}s`)
    .sign(secret);
}

/**
 * Verifies a session token's signature, expiry, and schema version. Returns the
 * decoded session, or `null` if the token is missing, tampered with, expired,
 * or minted by an incompatible `SESSION_VERSION`.
 */
export async function verifySessionToken(
  token: string,
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.ver !== SESSION_VERSION) {
      console.info(
        `Session version mismatch (found=${payload.ver ?? "none"}, expected=${SESSION_VERSION}, sub=${payload.sub ?? "none"}, username=${payload.username ?? "none"}); treating as outdated`,
      );
      return null;
    }
    if (!payload.sub) {
      console.info(
        `Session missing sub (ver=${payload.ver ?? "none"}, username=${payload.username ?? "none"}); treating as outdated`,
      );
      return null;
    }
    return {
      sub: payload.sub,
      username: payload.username as string | undefined,
    };
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      const { sub, username, exp } = err.payload;
      console.info(
        `Session expired (sub=${sub}, username=${username ?? "none"}, expiredAt=${exp ? new Date(exp * 1000).toISOString() : "unknown"})`,
      );
      return null;
    }
    console.error("Session verification failed:", err);
    return null;
  }
}
