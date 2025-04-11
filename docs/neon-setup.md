# Setting Up Neon PostgreSQL for LLM Sandbox

This guide will help you set up a Neon PostgreSQL database for the LLM Sandbox application.

## Step 1: Create a Neon Account

1. Go to [Neon](https://neon.tech/) and sign up for an account
2. Verify your email address

## Step 2: Create a New Project

1. From the Neon dashboard, click "New Project"
2. Give your project a name (e.g., "llm-sandbox")
3. Select a region close to your users
4. Click "Create Project"

## Step 3: Enable the Vector Extension

1. In your project dashboard, go to the "SQL Editor" tab
2. Run the following SQL command:
   \`\`\`sql
   CREATE EXTENSION IF NOT EXISTS vector;
   \`\`\`
3. If you see an error, contact Neon support to enable the vector extension for your project

## Step 4: Get Your Connection String

1. In your project dashboard, go to the "Connection Details" tab
2. Copy the connection string (it should look like `postgres://user:password@hostname:port/database`)

## Step 5: Add the Connection String to Your Environment

1. Open your `.env.local` file
2. Add or update the `DATABASE_URL` variable with your connection string:
   \`\`\`
   DATABASE_URL=postgres://user:password@hostname:port/database
   \`\`\`

## Step 6: Test the Connection

1. Run the test script to verify your connection:
   \`\`\`
   npm run test-db
   \`\`\`
2. If successful, you should see a message confirming the connection and listing any existing tables

## Step 7: Set Up the Database Tables

1. Run the database setup script:
   \`\`\`
   npm run setup-db
   \`\`\`
2. This will create all the necessary tables for the LLM Sandbox application

## Troubleshooting

If you encounter any issues:

1. **Connection Errors**: Make sure your connection string is correct and that your IP is allowed in Neon's connection settings
2. **Vector Extension**: If the vector extension is not available, you can still use the application with reduced functionality
3. **Permission Issues**: Ensure your Neon user has the necessary permissions to create tables and extensions
\`\`\`

Now let's implement the authentication system with NextAuth.js:
