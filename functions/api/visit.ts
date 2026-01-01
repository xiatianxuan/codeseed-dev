// functions/api/visit.ts
import type { PagesFunction, D1Database } from '@cloudflare/workers-types';

// 注意：绑定名 "codeseed-dev-db" 在 JS 中变为 "codeseed_dev_db"
interface Env {
  codeseed_dev_db: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // 从 env 中解构出 D1 数据库实例（使用实际绑定变量名）
    const { codeseed_dev_db: DB } = context.env;

    // 1. 创建计数表（如果不存在）
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY,
        page TEXT UNIQUE,
        visits INTEGER DEFAULT 0
      )
    `).run();

    // 2. 初始化首页记录（如果不存在）
    await DB.prepare(
      `INSERT OR IGNORE INTO stats (page, visits) VALUES ('homepage', 0)`
    ).run();

    // 3. 增加访问量
    await DB.prepare(
      `UPDATE stats SET visits = visits + 1 WHERE page = 'homepage'`
    ).run();

    // 4. 查询当前访问量
    const { results } = await DB.prepare(
      `SELECT visits FROM stats WHERE page = 'homepage'`
    ).all();

    const count = results?.[0]?.visits ?? 0;

    // 5. 返回成功响应
    return new Response(JSON.stringify({
      success: true,
      totalVisits: count
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    // 捕获所有异常，避免 Worker 崩溃（Error 1101 的根源！）
    console.error("Visitor counter error:", error);

    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update visitor count",
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};