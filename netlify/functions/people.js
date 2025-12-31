import { neon } from "@neondatabase/serverless";

export default async (req) => {
  try {
    // Netlify provides this automatically when you enable Netlify DB:
    // - NETLIFY_DATABASE_URL
    // - NETLIFY_DATABASE_URL_UNPOOLED (sometimes)
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    // Adjust table/column names to match your schema
    // Example schema: people(name text, region text, location text, party text)
    const rows = await sql`
      SELECT id, name, region, district, party, fid, mid, sid
      FROM people
      ORDER BY name, id, region, district, party, fid, mid, sid
    `;

    // Convert DB rows -> the same "object keyed by name" shape your group() expects
    // (so you don't have to rewrite group())
    const data = {};
    for (const r of rows) {
      data[r.name] = {
        ID: r.id,
        Region: r.region,
        District: r.district,
        Party: r.party,
        FID: r.fid,
        MID: r.mid,
        SID: r.sid,
      };
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        // optional if your function is called from same origin; safe to keep:
        "access-control-allow-origin": "*",
      },
    });
  } catch (err) {
    console.error("people function error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to load people" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};