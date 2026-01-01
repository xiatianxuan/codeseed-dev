import type { PagesFunction, D1Database } from '@cloudflare/workers-types';

// 定义你的环境变量类型
interface Env {
  DB: D1Database;
}

// 👇 关键：PagesFunction<Env> 而不是 PagesFunction
export const onRequest: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  // 1. 创建计数表（如果不存在）
  await DB.prepare(
    `CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY,
      page TEXT UNIQUE,
      visits INTEGER DEFAULT 0
    )`
  ).run();

  // 2. 初始化首页计数（如果不存在）
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

  const count = results[0]?.visits || 0;

  // 5. 返回 JSON 响应
  return new Response(JSON.stringify({ 
    success: true, 
    totalVisits: count 
  }), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};