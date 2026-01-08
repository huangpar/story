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
      const { id, region, district, fid, mid, sid, is_educator, is_politician, is_entertainer, role_id } = body;

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

        // Handle specific politician role (e.g. Governor, Senator)
        if (role_id) {
          await sql`
                INSERT INTO politician_role (person_id, role_id)
                VALUES (${id}, ${role_id})
                ON CONFLICT (person_id, role_id) DO NOTHING
            `;
          // Note: The primary key is (person_id, role_id), which implies a person can have multiple roles. 
          // However, usually we want to set THE role. If we want single role per person, we might need to delete others.
          // For now, let's assume we want to clear previous roles or just add this one.
          // Given the UI will likely be a dropdown (single selection), we should probably clear old roles or ensure 1:1 if desired.
          // But the schema is M:N (person_id, role_id is PK). 
          // Let's just INSERT for now. If user wants to change, they might need to unset? 
          // Actually, if I change from Governor to Senator, I should probably delete Governor.
          // Let's simpler: Delete all roles for this person then insert new one.
          await sql`DELETE FROM politician_role WHERE person_id = ${id} AND role_id != ${role_id}`;
          // Wait, if I delete != role_id, that keeps the current one if it exists.
        } else {
          // If role_id is null/undefined, maybe clean up? 
          // Let's leave it alone for now unless explicitly asked to clear.
          // But if I uncheck "Politician", I should probably clear roles.
        }

      } else {
        await sql`DELETE FROM politics WHERE person_id = ${id}`;
        await sql`DELETE FROM politician_role WHERE person_id = ${id}`;
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
        p.id, p.name, p.region, p.district, p.party, p.fid, p.mid, p.sid, p.gender,
        e.is_educator,
        pol.is_politician,
        ent.is_entertainer,
        r.id as role_id,
        r.name as role_name
      FROM people p
      LEFT JOIN education e ON p.id = e.person_id
      LEFT JOIN politics pol ON p.id = pol.person_id
      LEFT JOIN entertainment ent ON p.id = ent.person_id
      LEFT JOIN politician_role pr ON p.id = pr.person_id
      LEFT JOIN roles r ON pr.role_id = r.id
      ORDER BY p.region, p.district, p.name
    `;

    const data = {};
    for (const r of rows) {
      // If person already exists (due to multiple roles?), merge or just overwrite?
      // Since we want single role logic for UI, just taking the first one or overwriting is fine for now.
      // But wait, LEFT JOIN on roles could duplicate rows if a person has multiple roles.
      // We should handle that.

      if (!data[r.name]) {
        data[r.name] = {
          id: r.id,
          fid: r.fid,
          mid: r.mid,
          sid: r.sid,
          gender: r.gender,
          Region: r.region,
          Location: r.district,
          Party: r.party,
          is_educator: !!r.is_educator,
          is_politician: !!r.is_politician,
          is_entertainer: !!r.is_entertainer,
          role_id: r.role_id,         // Just take the first one found
          role_name: r.role_name      // Just take the first one found
        };
      }
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