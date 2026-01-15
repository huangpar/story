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
        region, district, fid, mid, sid,
        is_educator,
        is_politician, is_entertainer, role_id
      } = body;
      const id = parseInt(body.id);

      if (isNaN(id)) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid person ID" }) };
      }

      // Auto-migration
      try {
        await sql`ALTER TABLE entertainment ADD COLUMN IF NOT EXISTS company_id INTEGER`;
        await sql`ALTER TABLE entertainment ADD COLUMN IF NOT EXISTS position TEXT`;
        await sql`ALTER TABLE entertainment ADD COLUMN IF NOT EXISTS is_entertainer BOOLEAN DEFAULT true`;
        await sql`CREATE TABLE IF NOT EXISTS person_company (person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE, company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE, position TEXT, PRIMARY KEY (person_id, company_id))`;
        await sql`CREATE TABLE IF NOT EXISTS person_show (person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE, show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE, first_season INTEGER, last_season INTEGER, duration TEXT, role TEXT, PRIMARY KEY (person_id, show_id, first_season))`;
        await sql`ALTER TABLE person_show ADD COLUMN IF NOT EXISTS role TEXT`;
        await sql`CREATE TABLE IF NOT EXISTS class_schedules (person_id int NOT NULL, school_id bigint NOT NULL, subject_id bigint REFERENCES subjects(id) ON DELETE SET NULL, period int NOT NULL, day_type text NOT NULL, PRIMARY KEY (person_id, school_id, period, day_type), FOREIGN KEY (person_id, school_id) REFERENCES educator_schools(person_id, school_id) ON DELETE CASCADE)`;
        await sql`CREATE TABLE IF NOT EXISTS school_board (person_id int REFERENCES people(id) ON DELETE CASCADE, school_id bigint REFERENCES schools(id) ON DELETE CASCADE, ownership_percentage NUMERIC DEFAULT 0, is_chairperson BOOLEAN DEFAULT false, PRIMARY KEY (person_id, school_id))`;
        try { await sql`ALTER TABLE school_board ADD COLUMN IF NOT EXISTS is_chairperson BOOLEAN DEFAULT false`; } catch (e) { }
      } catch (migErr) { console.error("Auto-migration during PUT failed:", migErr); }

      // Update main people table
      await sql`
            UPDATE people 
            SET region = ${body.region || body.Region || null}, 
                district = ${body.district || body.Location || null}, 
                party = ${body.party || body.Party || null},
                fid = ${fid || null}, 
                mid = ${mid ? parseInt(mid) : null}, 
                sid = ${sid ? parseInt(sid) : null}
            WHERE id = ${id}
        `;

      // Handle Educator Role
      if (is_educator) {
        const { education_assignments } = body;
        await sql`INSERT INTO education (person_id, is_educator) VALUES (${id}, true) ON CONFLICT (person_id) DO UPDATE SET is_educator = true`;

        if (Array.isArray(education_assignments)) {
          // IMPORTANT: Delete old ones first (this cascade deletes schedules)
          await sql`DELETE FROM educator_schools WHERE person_id = ${id}`;

          for (const asgn of education_assignments) {
            const schId = parseInt(asgn.school_id);
            if (!isNaN(schId)) {
              let gl = asgn.grade_levels;
              if (gl && !Array.isArray(gl)) {
                gl = String(gl).split(',').map(s => s.trim());
              }
              if (Array.isArray(gl) && gl.length === 0) gl = null;

              if (Array.isArray(gl) && gl.length === 0) gl = null;

              console.log(`PUT: Inserting grade_levels for ${schId}:`, gl, typeof gl, Array.isArray(gl));

              await sql`
                INSERT INTO educator_schools (person_id, school_id, position, grade_levels)
                VALUES (${id}, ${schId}, ${asgn.position || null}, ${gl})
              `;

              if (Array.isArray(asgn.subjects)) {
                for (const subjId of asgn.subjects) {
                  const sbid = parseInt(subjId);
                  if (!isNaN(sbid)) {
                    await sql`INSERT INTO teaching_assignments (person_id, school_id, subject_id) VALUES (${id}, ${schId}, ${sbid})`;
                  }
                }
              }

              if (Array.isArray(asgn.schedules)) {
                for (const sched of asgn.schedules) {
                  const sbid = (sched.subject_id && !isNaN(parseInt(sched.subject_id))) ? parseInt(sched.subject_id) : null;
                  const period = parseInt(sched.period);
                  if (!isNaN(period)) {
                    await sql`
                      INSERT INTO class_schedules (person_id, school_id, subject_id, period, day_type)
                      VALUES (${id}, ${schId}, ${sbid}, ${period}, ${sched.day_type || 'regular'})
                    `;
                  }
                }
              }
            }
          }
        }
      } else {
        await sql`DELETE FROM education WHERE person_id = ${id}`;
      }

      // Handle School Board
      const { board_assignments } = body;
      if (Array.isArray(board_assignments)) {
        await sql`DELETE FROM school_board WHERE person_id = ${id}`;
        for (const ba of board_assignments) {
          const schId = parseInt(ba.school_id);
          if (!isNaN(schId)) {
            await sql`INSERT INTO school_board (person_id, school_id, ownership_percentage, is_chairperson) VALUES (${id}, ${schId}, ${parseFloat(ba.ownership_percentage) || 0}, ${!!ba.is_chairperson})`;
          }
        }
      }

      // Handle Politicians
      if (is_politician) {
        await sql`INSERT INTO politics (person_id, is_politician) VALUES (${id}, true) ON CONFLICT (person_id) DO UPDATE SET is_politician = true`;
        if (role_id) {
          await sql`DELETE FROM politician_role WHERE person_id = ${id} AND role_id != ${role_id}`;
          await sql`INSERT INTO politician_role (person_id, role_id) VALUES (${id}, ${role_id}) ON CONFLICT DO NOTHING`;
        }
      } else {
        await sql`DELETE FROM politics WHERE person_id = ${id}`;
        await sql`DELETE FROM politician_role WHERE person_id = ${id}`;
      }

      // Handle Entertainer
      try {
        if (is_entertainer) {
          const { entertainer_company_id, entertainer_position, studio_assignments, show_assignments } = body;
          await sql`INSERT INTO entertainment (person_id, is_entertainer, company_id, position) VALUES (${id}, true, ${entertainer_company_id || null}, ${entertainer_position || null}) ON CONFLICT (person_id) DO UPDATE SET is_entertainer = true, company_id = EXCLUDED.company_id, position = EXCLUDED.position`;

          if (studio_assignments !== undefined) {
            await sql`DELETE FROM person_company WHERE person_id = ${id}`;
            if (Array.isArray(studio_assignments)) {
              for (const sa of studio_assignments) {
                const cid = parseInt(sa.company_id);
                if (!isNaN(cid)) await sql`INSERT INTO person_company (person_id, company_id, position) VALUES (${id}, ${cid}, ${sa.position || null}) ON CONFLICT DO NOTHING`;
              }
            }
          }

          if (show_assignments !== undefined) {
            await sql`DELETE FROM person_show WHERE person_id = ${id}`;
            if (Array.isArray(show_assignments)) {
              for (const sa of show_assignments) {
                const sid_show = parseInt(sa.show_id);
                if (!isNaN(sid_show)) await sql`INSERT INTO person_show (person_id, show_id, first_season, last_season, duration, role) VALUES (${id}, ${sid_show}, ${sa.first_season || null}, ${sa.last_season || null}, ${sa.duration || null}, ${sa.role || null})`;
              }
            }
          }
        } else {
          await sql`DELETE FROM entertainment WHERE person_id = ${id}`;
        }
      } catch (entErr) { console.error("PUT: entertainment failed:", entErr); }

      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Updated" }),
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

    console.log(`GET: Found ${rows.length} base people rows`);

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
      console.log(`GET: Loaded ${allEduAssignments.length} edu assignments`);
    } catch (eduErr) { console.error("educator_schools query failed:", eduErr); }

    let allTeachingAssignments = [];
    try {
      allTeachingAssignments = await sql`
            SELECT ta.*, sb.name as subject_name
            FROM teaching_assignments ta
            JOIN subjects sb ON ta.subject_id = sb.id
        `;
      console.log(`GET: Loaded ${allTeachingAssignments.length} teaching assignments`);
    } catch (taErr) { console.error("teaching_assignments query failed:", taErr); }

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

    let allBoardAssignments = [];
    try {
      allBoardAssignments = await sql`
        SELECT sb.*, s.name as school_name 
        FROM school_board sb
        JOIN schools s ON sb.school_id = s.id
      `;
    } catch (boardErr) { console.error("school_board query failed:", boardErr); }

    console.log(`GET: Loaded ${allSchedules.length} schedules and ${allBoardAssignments.length} board assignments`);

    console.log(`Merging ${allShowAssignments.length} assignments into ${rows.length} rows`);

    const data = {};
    for (const r of rows) {
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
          name: r.name,
          fid: r.fid,
          mid: r.mid,
          sid: r.sid,
          gender: r.gender,
          Region: r.region,
          Location: r.district,
          Party: r.party,
          is_educator: !!r.is_educator,
          schools: allEduAssignments
            .filter(es => Number(es.person_id) === Number(r.id))
            .map(es => ({
              id: es.school_id,
              name: es.school_name,
              position: es.position,
              grade_levels: es.grade_levels,
              city: es.city,
              region: es.region,
              subjects: allTeachingAssignments
                .filter(ta => Number(ta.person_id) === Number(r.id) && Number(ta.school_id) === Number(es.school_id))
                .map(ta => ({ id: ta.subject_id, name: ta.subject_name })),
              schedules: allSchedules
                .filter(s => Number(s.person_id) === Number(r.id) && Number(s.school_id) === Number(es.school_id))
                .map(s => ({
                  subject_id: s.subject_id,
                  period: s.period,
                  day_type: s.day_type
                }))
            })),
          board_memberships: allBoardAssignments
            .filter(ba => Number(ba.person_id) === Number(r.id))
            .map(ba => ({
              school_id: ba.school_id,
              school_name: ba.school_name,
              ownership_percentage: ba.ownership_percentage,
              is_chairperson: !!ba.is_chairperson
            })),
          is_politician: !!r.is_politician,
          is_entertainer: !!r.is_entertainer,
          role_id: r.role_id,
          role_name: r.role_name,
          studios: allCompanyAssignments
            .filter(pc => Number(pc.person_id) === Number(r.id))
            .map(pc => ({
              id: pc.company_id,
              name: pc.company_name,
              position: pc.position
            })),
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
