# Client Application Migration: Supabase JS to Data Connect SDK

This guide explains how to modernize your client application to use Firebase Authentication and the Firebase Data Connect generated SDK.

## Prerequisites

1.  **Bundler (Webpack, Vite, etc.)**: Data Connect SDKs are generated as ES Modules. Your project must support ES Modules.
2.  **Firebase Web Config**: Get this from **Firebase Console > Project Settings > General**.

## 1. Setup Environment

### Initialize Bundler
Ensure your project is set up to bundle ES Modules. If you are using a tool like Vite/Webpack/Rollup, ensure it is configured to handle `nodes_modules` imports.

If you are starting fresh, we recommend initializing a modern JavaScript project:

```bash
npm init -y
npm install firebase
# Install your preferred bundler (e.g., vite, webpack)
```

### Update Entry Point
Ensure your HTML points to your entry script as a module if supported by your bundler/browser:
```html
<script type="module" src="app.js"></script>
```

## 2. Generate Data Connect SDK

Configure `dataconnect/connector/connector.yaml` to output the JS SDK:

```yaml
generate:
  javascriptSdk:
    outputDir: "../../client-app/generated/js"
    package: "@my-org/sdk"
```

Run the generator:
```bash
firebase dataconnect:sdk:generate
```

Install the local SDK package:
```bash
cd client-app
npm install ./generated/js
```

## 3. Refactor Client Code

### Authentication
Replace `supabase.auth` with `firebase/auth`.

**Supabase:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

**Firebase:**
```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
const auth = getAuth();
await signInWithEmailAndPassword(auth, email, password);
```

### Data Operations
Replace `supabase.from('table')` with Data Connect SDK functions (defined in `queries.gql` and `mutations.gql`).

**Supabase:**
```javascript
const { data, error } = await supabase.from('todos').select('*');
```

**Data Connect:**
```javascript
import { listMyItems, getDataConnect, connectorConfig } from '@my-org/sdk';
import { getAuth } from 'firebase/auth';

const dataConnect = getDataConnect(connectorConfig);
const response = await listMyItems(dataConnect);
const items = response.data.items;
```

### Authorization
Ensure you pass the `uid` if your mutations require it (e.g. `CreateItem`).
Note: Data Connect queries/mutations marked `@auth(level: USER)` will automatically use the Firebase Auth token if `auth` is initialized.

```javascript
const user = getAuth().currentUser;
await createItem(dataConnect, { 
    title: "New Item", 
    uid: user.uid 
});
```

## 4. Verification

Run your dev server:
```bash
# Run your dev server (command depends on your tool)
npm run dev
```
Open the local URL (e.g. `http://localhost:3000`) and verify Login and Todo operations.
