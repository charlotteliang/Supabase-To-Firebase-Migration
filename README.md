# Supabase to Firebase Migration Tools

This repository contains tools and documentation for migrating a project from Supabase to Firebase.

## detailed Guide

For a completely detailed walkthrough of the migration process, please refer to the [Supabase to Firebase Migration Guide](./supabase-to-firebase-migration-guide.md).

## Repository Structure

- `migration_tool/`: Contains the Node.js scripts for executing the migration.
  - `auth/`: Scripts for exporting users from Supabase and importing them to Firebase Authentication.
  - `firestore/`: Scripts for exporting data from Supabase tables and importing them to Firestore.
- `supabase-to-firebase-migration-guide.md`: Step-by-step instructions for running the migration.

## Quick Start

1.  **Prerequisites**:
    -   Ensure you have the **Firebase MCP Server** and **Supabase MCP Server** installed in your MCP client.

2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    (This project comes with a `package.json`. Run `npm install` to get `pg`, `firebase-admin`, and `@supabase/supabase-js`.)

3.  **Setup Configuration**:
    -   Place `supabase-service.json` (Supabase credentials) and `firebase-service.json` (Firebase Service Account) in the root directory.
    -   **Important**: Do not commit these files. They are added to `.gitignore`.

4.  **Run Migration**:
    Follow the steps in the [Migration Guide](./supabase-to-firebase-migration-guide.md) to execute the scripts in order.
