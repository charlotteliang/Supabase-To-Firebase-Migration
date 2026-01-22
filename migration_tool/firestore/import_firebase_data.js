
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, '../../firebase-service.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
    const todosFile = path.resolve(__dirname, 'todos_export.json');
    if (!fs.existsSync(todosFile)) {
        console.error('todos_export.json not found.');
        return;
    }

    const todos = JSON.parse(fs.readFileSync(todosFile, 'utf8'));
    console.log(`Importing ${todos.length} todos to Firestore...`);

    const batchSize = 500;
    let batch = db.batch();
    let count = 0;

    for (const todo of todos) {
        let docRef = db.collection('todos').doc(todo.id.toString());

        const docData = { ...todo };
        if (docData.createdAt) {
            if (typeof docData.createdAt === 'string') {
                docData.createdAt = new Date(docData.createdAt);
            } else if (docData.createdAt._seconds) {
                // It's a standard Firestore Timestamp object export
                docData.createdAt = admin.firestore.Timestamp.fromMillis(
                    docData.createdAt._seconds * 1000 + docData.createdAt._nanoseconds / 1000000
                );
            }
        }

        batch.set(docRef, docData);
        count++;

        if (count % batchSize === 0) {
            await batch.commit();
            console.log(`Committed batch of ${batchSize}`);
            batch = db.batch();
        }
    }

    if (count % batchSize !== 0) {
        await batch.commit();
        console.log(`Committed final batch.`);
    }

    console.log('Data import complete.');
}

importData();
