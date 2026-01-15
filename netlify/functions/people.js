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
      const {
        id, region, district, fid, mid, sid,
        is_educator, school_id, edu_position, edu_subjects, // edu_subjects is expected as array of IDs
        is_politician, is_entertainer, role_id
      } = body;

      // Auto-migration: Ensure entertainment schema is correct
      try {
        await sql`ALTER TABLE entertainment ADD COLUMN IF NOT EXISTS company_id INTEGER`;
        await sql`ALTER TABLE entertainment ADD COLUMN IF NOT EXISTS position TEXT`;
        await sql`ALTER TABLE entertainment ADD COLUMN IF NOT EXISTS is_entertainer BOOLEAN DEFAULT true`;
        await sql`
          CREATE TABLE IF NOT EXISTS person_company (
            person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
            company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            position TEXT,
            PRIMARY KEY (person_id, company_id)
          )
        `;
        await sql`
          CREATE TABLE IF NOT EXISTS person_show (
            person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
            show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
            first_season INTEGER,
            last_season INTEGER,
            duration TEXT,
            role TEXT,
            PRIMARY KEY (person_id, show_id, first_season)
          )
        `;
        // Handle migration of existing table
        try {
          await sql`ALTER TABLE person_show ADD COLUMN IF NOT EXISTS role TEXT`;
          await sql`ALTER TABLE person_show DROP CONSTRAINT IF EXISTS person_show_pkey`;
          await sql`ALTER TABLE person_show ADD PRIMARY KEY (person_id, show_id, first_season)`;
        } catch (e) {
          // Ignore if it fails (likely already correct)
        }
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
        const { education_assignments } = body;

        await sql`
            INSERT INTO education (person_id, is_educator) 
            VALUES (${id}, true) 
            ON CONFLICT (person_id) DO UPDATE SET is_educator = true
        `;

        if (Array.isArray(education_assignments)) {
          const pid = parseInt(id);
          // Delete old assignments to replace with new ones
          // We need to be careful with cascading deletes. 
          // teaching_assignments references educator_schools(person_id, school_id)
          // educator_schools is deleted here.
          await sql`DELETE FROM educator_schools WHERE person_id = ${pid}`;

          for (const asgn of education_assignments) {
            const sid = parseInt(asgn.school_id);
            if (!isNaN(sid)) {
              await sql`
                INSERT INTO educator_schools (person_id, school_id, position, grade_levels)
                VALUES (${pid}, ${sid}, ${asgn.position || null}, ${asgn.grade_levels || null})
              `;

              if (Array.isArray(asgn.subjects) && asgn.subjects.length > 0) {
                for (const subjId of asgn.subjects) {
                  const sbid = parseInt(subjId);
                  if (!isNaN(sbid)) {
                    await sql`
                      INSERT INTO teaching_assignments (person_id, school_id, subject_id)
                      VALUES (${pid}, ${sid}, ${sbid})
                    `;
                  }
                }
              }

              // Handle Schedules
              if (Array.isArray(asgn.schedules)) {
                // Delete existing schedules for this person-school combo
                await sql`DELETE FROM class_schedules WHERE person_id = ${pid} AND school_id = ${sid}`;
                for (const sched of asgn.schedules) {
                  const sbid = sched.subject_id ? parseInt(sched.subject_id) : null;
                  const period = parseInt(sched.period);
                  if (!isNaN(period)) {
                    await sql`
                      INSERT INTO class_schedules (person_id, school_id, subject_id, period, day_type)
                      VALUES (${pid}, ${sid}, ${sbid}, ${period}, ${sched.day_type || 'regular'})
                    `;
                  }
                }
              }
            }
          }
        }
      } else {
        await sql`DELETE FROM education WHERE person_id = ${id}`;
        await sql`DELETE FROM educator_schools WHERE person_id = ${id}`;
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
          const {
            entertainer_company_id,
            entertainer_position,
            studio_assignments,
            show_assignments
          } = body;

          // Ensure basic entertainer flag is set
          await sql`
            INSERT INTO entertainment (person_id, is_entertainer, company_id, position)
            VALUES (${id}, true, ${entertainer_company_id || null}, ${entertainer_position || null})
            ON CONFLICT (person_id) DO UPDATE SET 
              is_entertainer = true, 
              company_id = EXCLUDED.company_id,
              position = EXCLUDED.position
          `;

          // Handle Multi-Studio assignments
          if (studio_assignments !== undefined) {
            console.log(`PUT: Updating studios for person ${id}`, studio_assignments);
            try {
              const pid = parseInt(id);
              await sql`DELETE FROM person_company WHERE person_id = ${pid}`;
              if (studio_assignments && studio_assignments.length > 0) {
                for (const sa of studio_assignments) {
                  const cid = parseInt(sa.company_id);
                  if (!isNaN(cid)) {
                    await sql`
                      INSERT INTO person_company (person_id, company_id, position)
                      VALUES (${pid}, ${cid}, ${sa.position || null})
                      ON CONFLICT (person_id, company_id) DO UPDATE SET position = EXCLUDED.position
                    `;
                  }
                }
              }
            } catch (studioErr) {
              console.error("PUT: person_company update failed:", studioErr);
            }
          } else if (entertainer_company_id !== undefined) {
            // Backward compatibility: If only single ID provided, update person_company accordingly
            await sql`
                INSERT INTO person_company (person_id, company_id, position)
                VALUES (${id}, ${entertainer_company_id}, ${entertainer_position || null})
                ON CONFLICT (person_id, company_id) DO UPDATE SET position = EXCLUDED.position
             `;
          }

          // Handle show assignments
          if (show_assignments !== undefined) {
            console.log(`PUT: Updating shows for person ${id}`, show_assignments);
            try {
              const pid = parseInt(id);
              await sql`DELETE FROM person_show WHERE person_id = ${pid}`;
              if (show_assignments && show_assignments.length > 0) {
                for (const sa of show_assignments) {
                  const sid = parseInt(sa.show_id);
                  if (!isNaN(sid)) {
                    console.log(`PUT: Inserting show ${sid} for person ${pid}`);
                    await sql`
                              INSERT INTO person_show (person_id, show_id, first_season, last_season, duration, role)
                              VALUES (${pid}, ${sid}, ${sa.first_season || null}, ${sa.last_season || null}, ${sa.duration || null}, ${sa.role || null})
                          `;
                  }
                }
              }
            } catch (showErr) {
              console.error("PUT: person_show update failed specific:", showErr.message, showErr.detail);
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
        // We return 500 to make it clear to frontend that it failed
        return {
          statusCode: 500,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ error: "Entertainment/Shows save failed", details: entErr.message }),
        };
      }

      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "Person updated successfully",
          savedShowCount: (body.show_assignments || []).length
        }),
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
          ent.company_id as ent_company_id,
          ent.position as ent_position,
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

    // Fetch ALL many-to-many company assignments
    let allCompanyAssignments = [];
    try {
      allCompanyAssignments = await sql`
        SELECT pc.*, c.name as company_name 
        FROM person_company pc
        JOIN companies c ON pc.company_id = c.id
      `;
    } catch (cErr) {
      console.error("person_company query failed:", cErr);
    }

    // Fetch education assignments separately
    let allEduAssignments = [];
    try {
      allEduAssignments = await sql`
            SELECT es.*, s.name as school_name, s.city, s.region
            FROM educator_schools es
            JOIN schools s ON es.school_id = s.id
        `;
    } catch (eduErr) { console.error("educator_schools query failed:", eduErr); }

    let allTeachingAssignments = [];
    try {
      allTeachingAssignments = await sql`
            SELECT ta.*, subj.name as subject_name
            FROM teaching_assignments ta
            JOIN subjects subj ON ta.subject_id = subj.id
        `;
    } catch (subjErr) { console.error("teaching_assignments query failed:", subjErr); }

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
        console.log(`Fallback person_show loaded: ${allShowAssignments.length} records`);
      } catch (e) {
        console.error("Absolute fallback for person_show failed:", e);
        allShowAssignments = [];
      }
    }

    let allSchedules = [];
    try {
      allSchedules = await sql`SELECT * FROM class_schedules`;
    } catch (schedErr) { console.error("class_schedules query failed:", schedErr); }

    console.log(`Merging ${allShowAssignments.length} assignments into ${rows.length} rows`);

    const data = {};
    for (const r of rows) {
      // Use ID as key to be unique, even if names collide
      if (!data[r.id]) {
        const personShows = allShowAssignments
          .filter(ps => String(ps.person_id) === String(r.id))
          .map(ps => ({
            id: ps.show_id,
            name: ps.show_name || `Show ${ps.show_id}`,
            first_season: ps.first_season,
            last_season: ps.last_season,
            duration: ps.duration,
            role: ps.role
          }));

        data[r.id] = {
          id: r.id,
          name: r.name, // Ensure name is inside the object
          fid: r.fid,
          mid: r.mid,
          sid: r.sid,
          gender: r.gender,
          Region: r.region,
          Location: r.district,
          Party: r.party,
          is_educator: !!r.is_educator,
          schools: allEduAssignments
            .filter(es => String(es.person_id) === String(r.id))
            .map(es => ({
              id: es.school_id,
              name: es.school_name,
              position: es.position,
              grade_levels: es.grade_levels,
              city: es.city,
              region: es.region,
              subjects: allTeachingAssignments
                .filter(ta => String(ta.person_id) === String(r.id) && String(ta.school_id) === String(es.school_id))
                .map(ta => ({ id: ta.subject_id, name: ta.subject_name })),
              schedules: allSchedules
                .filter(s => String(s.person_id) === String(r.id) && String(s.school_id) === String(es.school_id))
                .map(s => ({
                  subject_id: s.subject_id,
                  period: s.period,
                  day_type: s.day_type
                }))
            })),
          is_politician: !!r.is_politician,
          is_entertainer: !!r.is_entertainer,
          role_id: r.role_id,
          role_name: r.role_name,
          // Aggregate all studios
          studios: allCompanyAssignments
            .filter(pc => String(pc.person_id) === String(r.id))
            .map(pc => ({
              id: pc.company_id,
              name: pc.company_name,
              position: pc.position
            })),
          // Keep legacy single company/position if available for compatibility
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
      body: JSON.stringify(Object.values(data)),
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
