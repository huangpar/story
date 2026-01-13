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

      // Auto-migration: Ensure entertainment schema is correct
      try {
        await sql`ALTER TABLE entertainment ADD COLUMN IF NOT EXISTS company_id INTEGER`;
        await sql`ALTER TABLE entertainment ADD COLUMN IF NOT EXISTS position TEXT`;
        await sql`
          CREATE TABLE IF NOT EXISTS person_show (
            person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
            show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
            first_season INTEGER,
            last_season INTEGER,
            duration TEXT,
            PRIMARY KEY (person_id, show_id)
          )
        `;
      } catch (migErr) {
        console.error("Auto-migration during PUT failed:", migErr);
        // Continue anyway, individual queries below have their own try/catches
      }

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
      try {
        if (is_entertainer) {
          const { entertainer_company_id, entertainer_position, show_assignments } = body;

          // Only update if entertainer info is actually provided in payload
          // (This prevents wiping info when updating from Politicians page)
          if (entertainer_company_id !== undefined || entertainer_position !== undefined) {
            await sql`
                  INSERT INTO entertainment (person_id, is_entertainer, company_id, position) 
                  VALUES (${id}, true, ${entertainer_company_id || null}, ${entertainer_position || null}) 
                  ON CONFLICT (person_id) DO UPDATE SET 
                    is_entertainer = true,
                    company_id = EXCLUDED.company_id,
                    position = EXCLUDED.position
              `;
          } else {
            await sql`
                  INSERT INTO entertainment (person_id, is_entertainer) 
                  VALUES (${id}, true) 
                  ON CONFLICT (person_id) DO UPDATE SET is_entertainer = true
              `;
          }

          // Handle show assignments
          if (show_assignments !== undefined) {
            try {
              const pid = parseInt(id);
              await sql`DELETE FROM person_show WHERE person_id = ${pid}`;
              if (show_assignments && show_assignments.length > 0) {
                for (const sa of show_assignments) {
                  const sid = parseInt(sa.show_id);
                  if (!isNaN(sid)) {
                    await sql`
                              INSERT INTO person_show (person_id, show_id, first_season, last_season, duration)
                              VALUES (${pid}, ${sid}, ${sa.first_season || null}, ${sa.last_season || null}, ${sa.duration || null})
                          `;
                  }
                }
              }
            } catch (showErr) {
              console.error("PUT: person_show update failed:", showErr);
            }
          }
        } else {
          try {
            await sql`DELETE FROM entertainment WHERE person_id = ${id}`;
          } catch (e) {
            console.error("PUT: delete entertainment failed:", e);
          }
          try {
            await sql`DELETE FROM person_show WHERE person_id = ${id}`;
          } catch (e) {
            console.error("PUT: delete person_show failed:", e);
          }
        }
      } catch (entErr) {
        console.error("PUT: entertainment update failed:", entErr);
      }

      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Person updated successfully" }),
      };
    }

    let rows = [];
    try {
      rows = await sql`
        SELECT 
          p.id, p.name, p.region, p.district, p.party, p.fid, p.mid, p.sid, p.gender,
          e.is_educator,
          pol.is_politician,
          ent.is_entertainer,
          ent.position as ent_position,
          ent.company_id as ent_company_id,
          c.name as ent_company_name,
          r.id as role_id,
          r.name as role_name
        FROM people p
        LEFT JOIN education e ON p.id = e.person_id
        LEFT JOIN politics pol ON p.id = pol.person_id
        LEFT JOIN entertainment ent ON p.id = ent.person_id
        LEFT JOIN companies c ON ent.company_id = c.id
        LEFT JOIN politician_role pr ON p.id = pr.person_id
        LEFT JOIN roles r ON pr.role_id = r.id
        ORDER BY p.region, p.district, p.name
      `;
    } catch (queryErr) {
      console.error("Primary query failed, falling back to basic join:", queryErr);
      // Fallback to minimal join if extra entertainer columns or companies table JOIN fails
      rows = await sql`
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
    }

    // Fetch all show assignments to merge in JS
    let allShowAssignments = [];
    try {
      allShowAssignments = await sql`
        SELECT ps.*, s.name as show_name
        FROM person_show ps
        JOIN shows s ON ps.show_id = s.id
      `;
    } catch (showErr) {
      console.error("person_show query failed:", showErr);
      // Fallback: try without join if shows table is the problem
      try {
        allShowAssignments = await sql`SELECT * FROM person_show`;
      } catch (e) {
        allShowAssignments = [];
      }
    }

    const data = {};
    for (const r of rows) {
      if (!data[r.name]) {
        const personShows = allShowAssignments
          .filter(ps => String(ps.person_id) === String(r.id))
          .map(ps => ({
            id: ps.show_id,
            name: ps.show_name || `Show ${ps.show_id}`,
            first_season: ps.first_season,
            last_season: ps.last_season,
            duration: ps.duration
          }));

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
          role_id: r.role_id,
          role_name: r.role_name,
          company: r.is_entertainer && r.ent_company_id ? {
            id: r.ent_company_id,
            name: r.ent_company_name,
            position: r.ent_position
          } : (r.is_entertainer ? { id: null, name: "", position: "" } : null),
          shows: personShows
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
    console.error("Global people function error:", err);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: String(err?.message ?? err), stack: err?.stack }),
    };
  }
};
