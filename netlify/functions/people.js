const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { name, region, location, party } = body;

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

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body);
      const { id, region, district, fid, mid, sid, is_educator, is_politician, is_entertainer } = body;

      // Update main people table
      await sql`
            UPDATE people 
            SET region = ${region}, 
                district = ${district}, 
                fid = ${fid || null}, 
                mid = ${mid ? mid : null}, 
                sid = ${sid ? sid : null}
            WHERE id = ${id}
        `;

      // Handle Educator Role
      if (is_educator) {
        await sql`
                INSERT INTO education (person_id, is_educator) 
                VALUES (${id}, true) 
                ON CONFLICT (person_id) DO UPDATE SET is_educator = true
            `;
      } else {
        await sql`DELETE FROM education WHERE person_id = ${id}`;
      }

      // Handle Politician Role
      if (is_politician) {
        await sql`
                INSERT INTO politics (person_id, is_politician) 
                VALUES (${id}, true) 
                ON CONFLICT (person_id) DO UPDATE SET is_politician = true
            `;
      } else {
        await sql`DELETE FROM politics WHERE person_id = ${id}`;
      }

      // Handle Entertainer Role
      if (is_entertainer) {
        await sql`
                INSERT INTO entertainment (person_id, is_entertainer) 
                VALUES (${id}, true) 
                ON CONFLICT (person_id) DO UPDATE SET is_entertainer = true
            `;
      } else {
        await sql`DELETE FROM entertainment WHERE person_id = ${id}`;
      }

      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Person updated successfully" }),
      };
    }

    const rows = await sql`
      SELECT 
        p.id, p.name, p.region, p.district, p.party, p.fid, p.mid, p.sid,
        e.is_educator,
        pol.is_politician,
        ent.is_entertainer
      FROM people p
      LEFT JOIN education e ON p.id = e.person_id
      LEFT JOIN politics pol ON p.id = pol.person_id
      LEFT JOIN entertainment ent ON p.id = ent.person_id
      ORDER BY p.region, p.district, p.name
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
        is_educator: !!r.is_educator,
        is_politician: !!r.is_politician,
        is_entertainer: !!r.is_entertainer
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