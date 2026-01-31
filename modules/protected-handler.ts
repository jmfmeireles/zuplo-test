import type { ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const user = request.user;

  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - Token validation failed" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Handle different HTTP methods
  const method = request.method;

  if (method === "GET") {
    return new Response(
      JSON.stringify({
        message: "Access granted to protected resource",
        timestamp: new Date().toISOString(),
        userId: user.sub,
        resource: "protected-data",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (method === "POST") {
    const body = await request.json();
    return new Response(
      JSON.stringify({
        message: "Data received and processed",
        userId: user.sub,
        receivedData: body,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
}
