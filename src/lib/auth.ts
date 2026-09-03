import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "session_token";
const OAUTH_STATE_COOKIE = "gh_oauth_state";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

export interface SessionUser {
  id: string;
  githubId: string;
  username: string;
  avatarUrl: string | null;
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function setOAuthStateCookie(state: string) {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });
}

export async function consumeOAuthStateCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const state = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);
  return state;
}

export function generateOAuthState() {
  return randomToken(16);
}

export async function createSessionCookie(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({ data: { token, userId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    githubId: session.user.githubId,
    username: session.user.username,
    avatarUrl: session.user.avatarUrl,
  };
}

/** For Server Component pages: redirects to /login when unauthenticated. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/** Deletes the session both from the DB and the browser cookie. */
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
}
