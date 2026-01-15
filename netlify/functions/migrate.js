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
        // 3. Education Tables (Aligned with user schema)
        await sql`
            CREATE TABLE IF NOT EXISTS education (
                person_id int primary key references people(id) on delete cascade,
                is_educator boolean not null default false
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS schools (
                id bigserial primary key,
                name text not null,
                city text,
                region text
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS educator_schools (
                person_id int references people(id) on delete cascade,
                school_id bigint references schools(id) on delete cascade,
                position text,
                grade_levels text[],
                primary key (person_id, school_id)
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS subjects (
                id bigserial primary key,
                name text not null unique
            )
        `;
        try {
            await sql`ALTER TABLE subjects ADD COLUMN IF NOT EXISTS grade_level INTEGER`;
        } catch (subErr) {
            console.log("Subject column update skipped:", subErr.message);
        }
        await sql`
            CREATE TABLE IF NOT EXISTS teaching_assignments (
                person_id int not null,
                school_id bigint not null,
                subject_id bigint not null,
                primary key (person_id, school_id, subject_id),
                foreign key (person_id, school_id) references educator_schools(person_id, school_id) on delete cascade,
                foreign key (subject_id) references subjects(id) on delete cascade
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS class_schedules (
                person_id int NOT NULL,
                school_id bigint NOT NULL,
                subject_id bigint REFERENCES subjects(id) ON DELETE SET NULL,
                period int NOT NULL,
                day_type text NOT NULL,
                PRIMARY KEY (person_id, school_id, period, day_type),
                FOREIGN KEY (person_id, school_id) REFERENCES educator_schools(person_id, school_id) ON DELETE CASCADE
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS school_board (
                person_id int REFERENCES people(id) ON DELETE CASCADE,
                school_id bigint REFERENCES schools(id) ON DELETE CASCADE,
                ownership_percentage NUMERIC DEFAULT 0,
                is_chairperson BOOLEAN DEFAULT false,
                PRIMARY KEY (person_id, school_id)
            )
        `;

        // 4. Sample Data
        const schCount = await sql`SELECT count(*) FROM schools`;
        if (schCount[0].count === '0') {
            await sql`INSERT INTO schools (name, city, region) VALUES ('Hogwarts', 'Highlands', 'Scotland'), ('Ilvermorny', 'Mount Greylock', 'Massachusetts'), ('Brakebills', 'New York City', 'New York')`;
            await sql`INSERT INTO subjects (name) VALUES ('Potions'), ('Charms'), ('Transfiguration'), ('Defense Against the Dark Arts'), ('Physical Magic'), ('Traveling')`;
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
