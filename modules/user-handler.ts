import type { ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function (request: ZuploRequest, context: ZuploContext) {
  // The JWT is validated by the jwt-auth-policy
  // User info is available in request.user
  const user = request.user;

  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - No user found" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      message: "User information from JWT token",
      user: {
        sub: user.sub,
        data: user.data,
        aud: user.aud,
        iss: user.iss,
        exp: user.exp,
        iat: user.iat,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
