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
const { importUser, connectorConfig } = require('../../src/dataconnect-admin-generated');
const { getDataConnect } = require('firebase-admin/data-connect');

const dataConnect = getDataConnect(connectorConfig);

async function runImport() {
  const usersFile = path.resolve(__dirname, '../auth/supabase_users.json');
  if (!fs.existsSync(usersFile)) {
    console.error('supabase_users.json not found.');
    return;
  }
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  console.log(`Found ${users.length} users to import.`);

  for (const user of users) {
    try {
      const response = await importUser(dataConnect, {
        uid: user.uid,
        email: user.email
      });
      console.log(`Imported user ${user.uid}:`, JSON.stringify(response));
    } catch (err) {
      console.error(`Error importing user ${user.uid}:`, err);
    }
  }
}

runImport();
