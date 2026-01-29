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
}, 'listServicesApp');

const PROJECT_ID = 'supabase-migration-5976a';
const LOCATION = 'us-central1';

async function listServices() {
  try {
    const accessToken = await app.options.credential.getAccessToken();
    const token = accessToken.access_token;

    const url = `https://firebasedataconnect.googleapis.com/v1beta/projects/${PROJECT_ID}/locations/${LOCATION}/services`;

    console.log(`Fetching services from: ${url}`);

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
    console.log('Services:', JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('Error:', err);
  }
}

listServices();
