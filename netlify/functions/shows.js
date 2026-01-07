const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
    try {
        const sql = neon(process.env.NETLIFY_DATABASE_URL);

        // Check if company_id is provided in query (optional)
        const company_id = event.queryStringParameters ? event.queryStringParameters.company_id : null;

        let rows;
        if (company_id) {
            rows = await sql`SELECT * FROM shows WHERE company_id = ${company_id} ORDER BY name`;
        } else {
            rows = await sql`SELECT * FROM shows ORDER BY company_id, name`;
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rows),
        };
    } catch (err) {
        console.error("shows error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
