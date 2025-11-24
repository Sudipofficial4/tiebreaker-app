# 🚀 Supabase Setup Instructions

## Prerequisites
- Supabase account (https://supabase.com)
- Node.js installed

## Step 1: Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details and create

## Step 2: Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql`
4. Paste and click "Run"
5. Verify tables are created in **Table Editor**

## Step 3: Get API Credentials
1. Go to **Project Settings** > **API**
2. Find these values:
   - **Project URL**: `https://yztlhfagqasznzvyuljx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

## Step 4: Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://yztlhfagqasznzvyuljx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

## Step 5: Create Admin User
1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click "Add User"
3. Enter email and password for admin
4. Click "Create User"
5. Use these credentials to log in to the app

## Step 6: Install & Run
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Step 7: Test the Application
1. Open http://localhost:5173
2. Log in with your admin credentials
3. Create a tournament
4. Test match management
5. View live dashboards

## Features to Test
✅ Admin authentication
✅ Create tournament
✅ Add players (bulk/single)
✅ Generate rounds
✅ Start/finish matches
✅ View running matches dashboard
✅ View completed matches dashboard
✅ Export as PDF/JSON
✅ Real-time match updates

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` file exists
- Check variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after creating `.env.local`

### Error: "Failed to fetch"
- Check if Supabase URL is correct
- Verify anon key is copied correctly
- Check internet connection

### Authentication fails
- Verify user exists in Supabase Dashboard > Authentication
- Check if email confirmation is disabled (for development)
- Go to Authentication > Providers > Email and disable "Confirm Email"

### Tables not found
- Make sure you ran the SQL schema
- Check Table Editor to verify tables exist
- Verify RLS policies are enabled

## Database Structure
```
tournaments
├── id (uuid, primary key)
├── game_name (text)
├── admin_id (uuid, references auth.users)
├── is_complete (boolean)
└── winner (text)

players
├── id (uuid, primary key)
├── tournament_id (uuid, references tournaments)
├── name (text)
└── bye_count (integer)

rounds
├── id (uuid, primary key)
├── tournament_id (uuid, references tournaments)
└── round_number (integer)

matches
├── id (uuid, primary key)
├── round_id (uuid, references rounds)
├── match_id (text)
├── player1 (text)
├── player2 (text, nullable)
├── winner (text, nullable)
└── status (text: 'pending', 'in-progress', 'finished')
```

## Need Help?
- Supabase Docs: https://supabase.com/docs
- Project GitHub: https://github.com/Sudipofficial4/tiebreaker-app
