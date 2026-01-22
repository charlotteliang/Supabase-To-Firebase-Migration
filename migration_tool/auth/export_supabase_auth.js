
import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
const configPath = path.resolve(__dirname, '../../supabase-service.json');
if (!fs.existsSync(configPath)) {
    console.error('supabase-service.json not found in root.');
    process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (!config.dbHost || !config.dbPassword) {
    console.error('Database credentials (dbHost, dbPassword) missing in migration_config.json');
    process.exit(1);
}

const client = new Client({
    host: config.dbHost,
    port: config.dbPort || 5432,
    user: config.dbUser || 'postgres',
    password: config.dbPassword,
    database: 'postgres',
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
});

async function exportUsers() {
    try {
        await client.connect();
        console.log('Connected to Supabase DB.');

        // Select users with their bcrypt hashes
        const res = await client.query(`
            SELECT id, email, encrypted_password, raw_user_meta_data
            FROM auth.users
        `);

        // Use absolute path for output to be safe
        const outputPath = path.resolve(__dirname, 'supabase_users.json');

        const users = res.rows.map(row => ({
            uid: row.id,
            email: row.email,
            passwordHash: row.encrypted_password,
            metadata: row.raw_user_meta_data
        }));

        console.log(`Fetched ${users.length} users.`);

        fs.writeFileSync(outputPath, JSON.stringify(users, null, 2));
        console.log(`Exported to ${outputPath}`);

    } catch (err) {
        console.error('Error exporting users:', err);
    } finally {
        await client.end();
    }
}

exportUsers();
