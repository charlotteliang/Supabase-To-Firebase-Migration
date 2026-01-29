const pg = require('pg');
const { Client } = pg;
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../supabase-service.json');
if (!fs.existsSync(configPath)) {
  console.error('supabase-service.json not found.');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const client = new Client({
  host: config.dbHost,
  port: config.dbPort || 5432,
  user: config.dbUser || 'postgres',
  password: config.dbPassword,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function listTables() {
  try {
    await client.connect();
    // List tables in public schema
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('Tables in public schema:');
    for (const row of res.rows) {
      console.log(`- ${row.table_name}`);

      // Get columns for this table
      const cols = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [row.table_name]);

      console.log('  Columns:');
      cols.rows.forEach(c => {
        console.log(`    ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

  } catch (err) {
    console.error('Error listing tables:', err);
  } finally {
    await client.end();
  }
}

listTables();
