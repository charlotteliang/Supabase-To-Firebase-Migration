const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Load Service Account
const serviceAccountPath = path.resolve(__dirname, '../../firebase-service.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('firebase-service.json not found.');
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Import the generated SDK
// Since it's in a subfolder, we require it by path relative to this script
// Script is in SQLMigration/data/
// SDK is in src/dataconnect-admin-generated/
const { importTodo, connectorConfig } = require('../../src/dataconnect-admin-generated');

// We need to initialize the Data Connect service with the Admin SDK
const { getDataConnect } = require('firebase-admin/data-connect');

const dataConnect = getDataConnect(connectorConfig);

async function runImport() {
  const todosFile = path.resolve(__dirname, 'supabase_todos.json');
  if (!fs.existsSync(todosFile)) {
    console.error('supabase_todos.json not found.');
    return;
  }
  const todos = JSON.parse(fs.readFileSync(todosFile, 'utf8'));
  console.log(`Found ${todos.length} todos to import.`);

  for (const todo of todos) {
    try {
      // Validate or map fields if necessary
      // Supabase 'created_at' is usually ISO string. Data Connect Timestamp maps to String or specific object.
      // The generated SDK expects matching types.

      const response = await importTodo(dataConnect, {
        id: todo.id,
        title: todo.title,
        isComplete: todo.isComplete,
        createdAt: todo.createdAt, // Ensure this is a valid Timestamp string/object
        userId: todo.userId
      });

      console.log(`Imported todo ${todo.id}:`, JSON.stringify(response));

    } catch (err) {
      console.error(`Error importing todo ${todo.id}:`, err);
    }
  }
}

runImport();
