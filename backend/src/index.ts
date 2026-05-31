import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  guangyi: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());

app.post("/api/gleam", async (c) => {
  const { date, text, lightGleamUrl, darkGleamUrl, altText } =
    await c.req.json();

await c.env.guangyi
  .prepare(
    "INSERT OR REPLACE INTO gleams (date, text, lightUrl, darkUrl, altText) VALUES (?, ?, ?, ?, ?)",
  )
  .bind(date, text, lightGleamUrl, darkGleamUrl, altText)
  .run();


  return c.json({ status: "success" });
});

app.get("/api/gleam/latest", async (c) => {
  const dateParam = c.req.query("date");

  let stmt;
  if (dateParam) {
    stmt = c.env.guangyi
      .prepare("SELECT * FROM gleams WHERE date = ?")
      .bind(dateParam);
  } else {
    stmt = c.env.guangyi.prepare(
      "SELECT * FROM gleams ORDER BY date DESC LIMIT 1",
    );
  }

  const { results } = await stmt.all();
  return results.length > 0
    ? c.json(results[0])
    : c.json({ error: "Not found" }, 404);
});

export default app;
