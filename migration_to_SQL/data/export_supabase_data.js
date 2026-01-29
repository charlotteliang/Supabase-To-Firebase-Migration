const pg = require('pg');
const { Client } = pg;
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../../supabase-service.json');
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

async function exportTodos() {
  try {
    await client.connect();
    console.log('Connected to Supabase DB.');

    const res = await client.query(`
      SELECT id, title, is_complete, created_at, user_id
      FROM public.todos
    `);

    const todos = res.rows.map(row => ({
      id: row.id,
      title: row.title,
      isComplete: row.is_complete,
      createdAt: row.created_at, // Keep as Date object or string
      userId: row.user_id
    }));

    console.log(`Fetched ${todos.length} todos.`);

    const outputPath = path.resolve(__dirname, 'supabase_todos.json');
    fs.writeFileSync(outputPath, JSON.stringify(todos, null, 2));
    console.log(`Exported to ${outputPath}`);

  } catch (err) {
    console.error('Error exporting todos:', err);
  } finally {
    await client.end();
  }
}

exportTodos();
