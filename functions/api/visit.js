// functions/api/visit.js
export const onRequestGet = async (context) => {
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

    const count = results && results[0] ? results[0].visits : 0;

    return new Response(JSON.stringify({ success: true, totalVisits: count }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || "Unknown error"
    }), { status: 500 });
  }
};