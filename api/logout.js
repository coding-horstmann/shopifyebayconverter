module.exports = function handler(_request, response) {
  response.statusCode = 303;
  response.setHeader("Set-Cookie", "orlo_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  response.setHeader("Location", "/login.html");
  response.end();
};
