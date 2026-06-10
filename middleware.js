import { next } from "@vercel/functions";

const COOKIE_NAME = "orlo_auth";
const PUBLIC_PATHS = new Set(["/login", "/login.html", "/favicon.svg", "/favicon.ico"]);

export const config = {
  matcher: "/((?!api/login|api/logout).*)",
};

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

function parseCookies(header) {
  const cookies = {};
  String(header || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const index = part.indexOf("=");
      if (index > -1) {
        cookies[part.slice(0, index)] = decodeURIComponent(part.slice(index + 1));
      }
    });
  return cookies;
}

async function signPayload(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function isValidToken(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [payload, expires, signature] = parts;
  if (!payload || !expires || Number(expires) < Date.now()) {
    return false;
  }

  const expected = await signPayload(`${payload}.${expires}`, secret);
  if (expected.length !== signature.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }

  try {
    base64UrlDecode(payload);
  } catch {
    return false;
  }

  return diff === 0;
}

export default async function middleware(request) {
  const expectedPassword = process.env.APP_PASSWORD;
  if (!expectedPassword) {
    return next();
  }

  const url = new URL(request.url);
  if (PUBLIC_PATHS.has(url.pathname)) {
    return next();
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  if (await isValidToken(cookies[COOKIE_NAME], expectedPassword)) {
    return next();
  }

  const loginUrl = new URL("/login.html", request.url);
  loginUrl.searchParams.set("next", `${url.pathname}${url.search}`);
  return Response.redirect(loginUrl, 302);
}
