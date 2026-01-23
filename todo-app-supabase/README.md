# Supabase Todo App

A simple todo application built with Supabase for authentication and database. This app will be used to demonstrate the Supabase to Firebase migration process.

## Features

- User authentication (Sign up / Sign in / Sign out)
- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- User-specific todos (each user sees only their own todos)
- Row Level Security (RLS) for data protection

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in or create an account
2. Click "New Project"
3. Fill in your project details:
   - Project name: `todo-app` (or any name you prefer)
   - Database password: Choose a strong password
   - Region: Select the closest region to you
4. **IMPORTANT: Save your database password!** You will need it later for the migration to Firebase
5. Click "Create new project" and wait for it to be provisioned

### 2. Set Up the Database

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `schema.sql` into the editor
4. Click "Run" to execute the SQL
5. This will create the `todos` table with proper Row Level Security policies

### 3. Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** is enabled (it should be enabled by default)
3. Optional: For testing, you can disable email confirmation:
   - Go to **Authentication** > **Settings**
   - Under "Email Auth", toggle off "Enable email confirmations"
   - This allows you to sign up and immediately sign in without verifying email

### 4. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Go to **API** section
3. You'll need two values:
   - **Project URL**: Copy the URL (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy the `anon` `public` key

### 5. Configure the App

1. Open `config.js` in this directory
2. Replace the placeholder values with your actual Supabase credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_URL', // Replace with your Project URL
       anonKey: 'YOUR_SUPABASE_ANON_KEY' // Replace with your anon public key
   };
   ```

### 6. Run the App

Since this is a static HTML/JavaScript app, you can run it in several ways:

#### Option A: Using a Local Server (Recommended)

If you have Python installed:
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

If you have Node.js installed:
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run the server
http-server -p 8000

# Then open: http://localhost:8000
```

#### Option B: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option C: Direct File Opening

You can open `index.html` directly in your browser, but some features might not work due to CORS restrictions. Using a local server is recommended.

## Usage

### Sign Up

1. Open the app in your browser
2. Click "Sign up" at the bottom of the form
3. Enter an email and password (minimum 6 characters)
4. Click "Sign Up"
5. If email confirmation is disabled, you'll be automatically signed in
6. If email confirmation is enabled, check your email and click the confirmation link

### Sign In

1. Enter your email and password
2. Click "Sign In"

### Add Todos

1. Type your todo in the input field
2. Click "Add" or press Enter
3. Your todo will appear in the list below

### Complete Todos

- Click the checkbox next to a todo to mark it as complete
- Click again to mark it as incomplete

### Delete Todos

- Click the "Delete" button next to a todo
- Confirm the deletion in the popup

### Sign Out

- Click the "Sign Out" button in the top right

## Database Structure

### `todos` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to auth.users, identifies the todo owner |
| `task` | TEXT | The todo text |
| `completed` | BOOLEAN | Whether the todo is completed |
| `created_at` | TIMESTAMP | When the todo was created |
| `updated_at` | TIMESTAMP | When the todo was last updated |

### Security

Row Level Security (RLS) is enabled on the `todos` table with the following policies:

- Users can only view their own todos
- Users can only create todos for themselves
- Users can only update their own todos
- Users can only delete their own todos

## Testing the App

1. Create a test user (e.g., `test@example.com`)
2. Add several todos
3. Mark some as complete
4. Delete some todos
5. Sign out and create another user
6. Verify that users can't see each other's todos

## Next Steps

After testing the app with Supabase, you can use this app to test the migration process to Firebase. The migration will:

1. Export users from Supabase Authentication
2. Import users to Firebase Authentication
3. Export todos data from Supabase
4. Import todos data to Firebase Firestore
5. Update the app to use Firebase instead of Supabase

## Troubleshooting

### Can't sign in after sign up

- Check if email confirmation is required in Supabase settings
- Check your email for a confirmation link
- Or disable email confirmations in Supabase Authentication settings

### Todos not loading

- Check browser console for errors
- Verify your Supabase credentials in `config.js`
- Verify the `schema.sql` was executed successfully
- Check that Row Level Security policies are in place

### Database errors

- Make sure you ran the `schema.sql` file in the Supabase SQL Editor
- Check that the `todos` table exists in the Supabase Table Editor
- Verify that RLS policies are enabled

## Files

- `index.html`: The main HTML file with UI structure and styles
- `config.js`: Supabase configuration (you need to add your credentials here)
- `app.js`: Application logic for authentication and todo CRUD operations
- `schema.sql`: Database schema and security policies
- `README.md`: This file
