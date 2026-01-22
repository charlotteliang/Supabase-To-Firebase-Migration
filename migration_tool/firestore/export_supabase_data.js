
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../supabase-service.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Need Service Role to bypass RLS if needed, or if we want to be sure
const supabase = createClient(config.projectUrl, config.serviceRoleKey);

async function exportData() {
    console.log('Exporting todos...');

    const { data: todos, error } = await supabase
        .from('todos')
        .select('*');

    if (error) {
        console.error('Error fetching todos:', error);
        return;
    }

    const outputPath = path.resolve(__dirname, 'todos_export.json');
    console.log(`Fetched ${todos.length} todos.`);
    fs.writeFileSync(outputPath, JSON.stringify(todos, null, 2));
    console.log(`Saved to ${outputPath}`);
}

exportData();
