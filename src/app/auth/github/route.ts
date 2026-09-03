import { NextRequest, NextResponse } from "next/server";
import { generateOAuthState, setOAuthStateCookie } from "@/lib/auth";
import { getGithubAuthorizeUrl } from "@/lib/github-oauth";

export async function GET(request: NextRequest) {
  const state = generateOAuthState();
  await setOAuthStateCookie(state);

  const redirectUri = new URL("/auth/github/callback", request.nextUrl.origin).toString();
  const authorizeUrl = getGithubAuthorizeUrl(state, redirectUri);

  return NextResponse.redirect(authorizeUrl);
}
