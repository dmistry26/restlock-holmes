import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
const app = new Elysia()
  .use(openapi())
  .get("/", () => "Hello Elysia")
  .get("/hi", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
