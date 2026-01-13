const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
    try {
        const sql = neon(process.env.NETLIFY_DATABASE_URL);
        const shows = await sql`SELECT * FROM shows`;
        const assignments = await sql`SELECT * FROM person_show LIMIT 50`;
        const peopleCount = await sql`SELECT count(*) FROM people`;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shows, assignments, peopleCount }),
        };
    } catch (err) {
        return { statusCode: 500, body: String(err) };
    }
};
