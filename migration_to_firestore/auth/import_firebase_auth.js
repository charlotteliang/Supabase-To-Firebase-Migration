const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../../firebase-service.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('firebase-service.json not found in root.');
    process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function importUsers() {
    try {
        const usersFile = path.resolve(__dirname, 'supabase_users.json');
        if (!fs.existsSync(usersFile)) {
            console.error('supabase_users.json not found.');
            return;
        }

        const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        console.log(`Importing ${users.length} users...`);

        const chunks = [];
        const BATCH_SIZE = 1000;
        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            chunks.push(users.slice(i, i + BATCH_SIZE));
        }

        for (const chunk of chunks) {
            const records = chunk.map(u => ({
                uid: u.uid,
                email: u.email,
                passwordHash: Buffer.from(u.passwordHash),
            }));

            await admin.auth().importUsers(records, {
                hash: {
                    algorithm: 'BCRYPT'
                }
            });
            console.log(`Imported batch of ${records.length}`);
        }

        console.log('Auth import complete.');

    } catch (err) {
        console.error('Error importing users:', err);
    }
}

importUsers();
