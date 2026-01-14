const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
    try {
        const sql = neon(process.env.NETLIFY_DATABASE_URL);

        console.log("Starting migration...");

        // 1. Add columns to entertainment if they don't exist
        await sql`
            ALTER TABLE entertainment 
            ADD COLUMN IF NOT EXISTS company_id INTEGER,
            ADD COLUMN IF NOT EXISTS position TEXT,
            ADD COLUMN IF NOT EXISTS is_entertainer BOOLEAN DEFAULT true
        `;
        console.log("Entertainment table updated.");

        // 2. Create person_show table for assignments
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

        // If the table already exists, we might need to update the columns
        try {
            await sql`ALTER TABLE person_show ADD COLUMN IF NOT EXISTS role TEXT`;
        } catch (colErr) {
            console.log("Column update skipped:", colErr.message);
        }
        // If the table already exists, we might need to update the PK
        try {
            await sql`ALTER TABLE person_show DROP CONSTRAINT person_show_pkey`;
            await sql`ALTER TABLE person_show ADD PRIMARY KEY (person_id, show_id, first_season)`;
        } catch (pkErr) {
            console.log("PK update skipped (might already be correct or table empty):", pkErr.message);
        }
        // 3. Education Tables
        await sql`
            CREATE TABLE IF NOT EXISTS academies (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                location TEXT,
                description TEXT
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS majors (
                id SERIAL PRIMARY KEY,
                academy_id INTEGER REFERENCES academies(id) ON DELETE CASCADE,
                name TEXT NOT NULL
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS person_academy (
                person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
                academy_id INTEGER NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
                position TEXT,
                PRIMARY KEY (person_id, academy_id)
            )
        `;
        await sql`
            ALTER TABLE education 
            ADD COLUMN IF NOT EXISTS academy_id INTEGER REFERENCES academies(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS major_id INTEGER REFERENCES majors(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS role TEXT
        `;
        // 4. Sample Data
        const academies = await sql`SELECT id FROM academies LIMIT 1`;
        if (academies.length === 0) {
            const hogwarts = await sql`INSERT INTO academies (name, location, description) VALUES ('Hogwarts', 'Scotland', 'School of Witchcraft and Wizardry') RETURNING id`;
            const brakebills = await sql`INSERT INTO academies (name, location, description) VALUES ('Brakebills', 'New York', 'University for Magical Pedagogy') RETURNING id`;
            const ilvermorny = await sql`INSERT INTO academies (name, location, description) VALUES ('Ilvermorny', 'Massachusetts', 'North American School of Magic') RETURNING id`;

            await sql`INSERT INTO majors (academy_id, name) VALUES (${hogwarts[0].id}, 'Gryffindor'), (${hogwarts[0].id}, 'Slytherin'), (${hogwarts[0].id}, 'Ravenclaw'), (${hogwarts[0].id}, 'Hufflepuff')`;
            await sql`INSERT INTO majors (academy_id, name) VALUES (${brakebills[0].id}, 'Physical Kids'), (${brakebills[0].id}, 'Psychics'), (${brakebills[0].id}, 'Travelers')`;
        }
        console.log("Sample data added.");

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Migration successful" }),
        };
    } catch (err) {
        console.error("Migration failed:", err);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: String(err) }),
        };
    }
};
