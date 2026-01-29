const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load Service Account
const serviceAccountPath = path.resolve(__dirname, '../../firebase-service.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('firebase-service.json not found.');
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize app to get token
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
}, 'listConnectorsApp');

const PROJECT_ID = 'supabase-migration-5976a';
const LOCATION = 'us-central1';
const SERVICE_ID = 'todo-service';

async function listConnectors() {
  try {
    const accessToken = await app.options.credential.getAccessToken();
    const token = accessToken.access_token;

    // List Connectors
    const url = `https://firebasedataconnect.googleapis.com/v1beta/projects/${PROJECT_ID}/locations/${LOCATION}/services/${SERVICE_ID}/connectors`;

    console.log(`Fetching connectors from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`HTTP Error ${response.status}:`, text);
      return;
    }

    const data = await response.json();
    console.log('Connectors:', JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('Error:', err);
  }
}

listConnectors();
