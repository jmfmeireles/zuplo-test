import type { ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function (request: ZuploRequest, context: ZuploContext) {
  return new Response(
    JSON.stringify({
      message: "This is a public endpoint - no authentication required",
      timestamp: new Date().toISOString(),
      info: "Anyone can access this resource",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
