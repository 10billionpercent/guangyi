import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());

app.post("/api/gleam", async (c) => {
  const { date, text, lightGleamUrl, darkGleamUrl, altText } =
    await c.req.json();

  await c.env.DB.prepare(
    "INSERT INTO gleams (date, text, lightUrl, darkUrl, altText) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(date, text, lightGleamUrl, darkGleamUrl, altText)
    .run();

  return c.json({ status: "success" });
});

app.get("/api/gleam/latest", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM gleams ORDER BY date DESC LIMIT 1",
  ).all();
  return c.json(results[0]);
});

export default app;
