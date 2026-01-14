const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
    try {
        const sql = neon(process.env.NETLIFY_DATABASE_URL);

        const academy_id = event.queryStringParameters ? event.queryStringParameters.academy_id : null;

        let rows;
        if (academy_id) {
            rows = await sql`SELECT * FROM majors WHERE academy_id = ${academy_id} ORDER BY name`;
        } else {
            rows = await sql`SELECT * FROM majors ORDER BY academy_id, name`;
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rows),
        };
    } catch (err) {
        console.error("majors error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
