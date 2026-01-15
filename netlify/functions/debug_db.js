const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
    try {
        const sql = neon(process.env.NETLIFY_DATABASE_URL);
        const schema = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'people'
        `;
        return {
            statusCode: 200,
            body: JSON.stringify(schema, null, 2),
        };
    } catch (err) {
        return { statusCode: 500, body: String(err) };
    }
};
