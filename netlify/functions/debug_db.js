const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
    try {
        const sql = neon(process.env.NETLIFY_DATABASE_URL);

        const schema = await sql`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name IN ('person_show', 'entertainment', 'shows', 'people')
        `;

        const personShows = await sql`SELECT * FROM person_show LIMIT 10`;
        const shows = await sql`SELECT id, name FROM shows LIMIT 10`;
        const entertainment = await sql`SELECT * FROM entertainment LIMIT 10`;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schema, personShows, shows, entertainment }),
        };
    } catch (err) {
        return { statusCode: 500, body: String(err) };
    }
};
