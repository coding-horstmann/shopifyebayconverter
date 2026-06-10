const crypto = require("node:crypto");

const COOKIE_NAME = "orlo_auth";
const DAY_MS = 24 * 60 * 60 * 1000;

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function createToken(username, secret) {
  const payload = base64Url(JSON.stringify({ username }));
  const expires = String(Date.now() + 14 * DAY_MS);
  const signature = sign(`${payload}.${expires}`, secret);
  return `${payload}.${expires}.${signature}`;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
    });
    request.on("end", () => resolve(data));
    request.on("error", reject);
  });
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.statusCode = 405;
    response.setHeader("Allow", "POST");
    response.end("Method not allowed");
    return;
  }

  const expectedPassword = process.env.APP_PASSWORD;
  const expectedUser = process.env.APP_USERNAME || "atelier";

  if (!expectedPassword) {
    response.statusCode = 204;
    response.end();
    return;
  }

  const body = await readBody(request);
  const params = new URLSearchParams(body);
  const username = params.get("username") || "";
  const password = params.get("password") || "";
  const next = params.get("next") || "/";

  if (!safeEqual(username, expectedUser) || !safeEqual(password, expectedPassword)) {
    response.statusCode = 303;
    response.setHeader("Location", `/login.html?error=1&next=${encodeURIComponent(next.startsWith("/") ? next : "/")}`);
    response.end();
    return;
  }

  const token = createToken(username, expectedPassword);
  response.statusCode = 303;
  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${14 * 24 * 60 * 60}`,
  );
  response.setHeader("Location", next.startsWith("/") ? next : "/");
  response.end();
};
