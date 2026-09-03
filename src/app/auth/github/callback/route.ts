import { NextRequest, NextResponse } from "next/server";
import { consumeOAuthStateCookie, createSessionCookie } from "@/lib/auth";
import { exchangeCodeForAccessToken, fetchGithubUser } from "@/lib/github-oauth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const expectedState = await consumeOAuthStateCookie();

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=oauth_state", origin));
  }

  try {
    const redirectUri = new URL("/auth/github/callback", origin).toString();
    const accessToken = await exchangeCodeForAccessToken(code, redirectUri);
    const githubUser = await fetchGithubUser(accessToken);

    const user = await prisma.user.upsert({
      where: { githubId: String(githubUser.id) },
      update: {
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
      },
      create: {
        githubId: String(githubUser.id),
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
      },
    });

    await createSessionCookie(user.id);
  } catch (err) {
    console.error("GitHub OAuth callback failed", err);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
  }

  return NextResponse.redirect(new URL("/", origin));
}
