// functions/api/visit.ts
import type { EventContext } from '@cloudflare/workers-types';

// 定义你的环境变量类型
interface Env {
  DB: D1Database;
}

// 注意：这里不使用 PagesFunction<Env>，而是手动标注 context 类型
export const onRequestGet = async (context: EventContext<Env, any, any>) => {
  try {
    const DB = context.env.DB;

    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS stats (
        page TEXT PRIMARY KEY,
        visits INTEGER DEFAULT 0
      )
    `).run();

    await DB.prepare(
      `INSERT OR IGNORE INTO stats (page, visits) VALUES ('homepage', 0)`
    ).run();

    await DB.prepare(
      `UPDATE stats SET visits = visits + 1 WHERE page = 'homepage'`
    ).run();

    const { results } = await DB.prepare(
      `SELECT visits FROM stats WHERE page = 'homepage'`
    ).all();

    const count = results?.[0]?.visits ?? 0;

    return new Response(JSON.stringify({ success: true, totalVisits: count }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Visitor counter error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update visitor count",
      message: error instanceof Error ? error.message : String(error)
    }), { status: 500 });
  }
};