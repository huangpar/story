const { neon } = require("@neondatabase/serverless");

exports.handler = async () => {
  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const rows = await sql`
      SELECT id, name, region, district, party, fid, mid, sid
      FROM people
      ORDER BY region, district, name
    `;

    // Convert DB rows -> the same "object keyed by name" shape your group() expects
    // (so you don't have to rewrite group())
    const data = {};
    for (const r of rows) {
      data[r.name] = {
        ID: r.id,
        Region: r.region,
        District: r.district,
        Party: r.party,
        FID: r.fid,
        MID: r.mid,
        SID: r.sid,
      };
    }

    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("people function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};