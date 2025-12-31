const { neon } = require("@neondatabase/serverless");

exports.handler = async () => {
  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const rows = await sql`
      SELECT id, name, region, district, party, fid, mid, sid
      FROM people
      ORDER BY region, district, name
    `;

    const data = {};
    for (const r of rows) {
      data[r.name] = {
        id: r.id,
        fid: r.fid,
        mid: r.mid,
        sid: r.sid,
        Region: r.region,
        Location: r.district,
        Party: r.party,
      };
    }

    return {
        statusCode: 200,
        headers: { "content-type": "application/json",
                   "cache-control": "no-store",
        },
        body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("people function error:", err);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: String(err?.message ?? err) }),
    };
  }
};