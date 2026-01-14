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
        console.log("person_show table created/updated.");

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
