import { next } from "@vercel/functions";

export const config = {
  matcher: "/((?!favicon.svg|favicon.ico).*)",
};

function unauthorized() {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Atelier Orlo eBay Converter"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function safeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

export default function middleware(request) {
  const expectedPassword = process.env.APP_PASSWORD;
  if (!expectedPassword) {
    return next();
  }

  const expectedUser = process.env.APP_USERNAME || "atelier";
  const header = request.headers.get("authorization") || "";

  if (!header.startsWith("Basic ")) {
    return unauthorized();
  }

  let decoded = "";
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) {
    return unauthorized();
  }

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  if (safeEqual(user, expectedUser) && safeEqual(password, expectedPassword)) {
    return next();
  }

  return unauthorized();
}
