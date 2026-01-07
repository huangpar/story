const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
    try {
        const sql = neon(process.env.NETLIFY_DATABASE_URL);
        const rows = await sql`SELECT * FROM companies ORDER BY name`;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rows),
        };
    } catch (err) {
        console.error("companies error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
