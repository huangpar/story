const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { name, region, location, party } = body;

      // Create a new ID manually to avoid sequence issues
      const maxIdResult = await sql`SELECT MAX(id) as max_id FROM people`;
      const newId = (maxIdResult[0].max_id || 0) + 1;

      await sql`
            INSERT INTO people (id, name, region, district, party)
            VALUES (${newId}, ${name}, ${region}, ${location}, ${party})
        `;

      return {
        statusCode: 201,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Person added successfully" }),
      };
    }

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
      headers: {
        "content-type": "application/json",
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