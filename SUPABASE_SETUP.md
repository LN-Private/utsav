# Supabase Setup Guide for Utsav

## Prerequisites
1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. GitHub repository with your code

## Step 1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter details:
   - Name: `utsav`
   - Database Password: Create a strong password
   - Region: Select closest to Nepal (India - Mumbai or Singapore)
4. Wait for project to be ready (2-3 minutes)

## Step 2: Get Connection Details
1. In Supabase dashboard, go to **Settings** (⚙️ icon) → **Database**
2. Find the **Connection string** section
3. Copy the URI format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 3: Add Secrets to GitHub
1. Go to your GitHub repository: https://github.com/lngiri/utsav
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret" and add:

| Secret Name | Value |
|-------------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `SUPABASE_PROJECT_REF` | Your project ref (found in Supabase URL: app.supabase.com/project/**abc123**) |

## Step 4: Connect GitHub to Supabase (Optional - for CI/CD)
1. Go to Supabase Dashboard → **Settings** → **GitHub**
2. Click "Connect GitHub repository"
3. Authorize Supabase to access your repositories
4. Select the `utsav` repository
5. Enable "Automatic migration" if you want Supabase to run migrations automatically

## Step 5: Update Your Code
Replace `your-project-id` in `supabase/config.toml` with your actual Supabase project ID.

## Step 6: Push Changes to GitHub
```bash
git add .
git commit -m "Add Supabase configuration"
git push origin master
```

## Environment Variables
Update your `.env` file with Supabase credentials:
```env
DATABASE_URL="postgresql://postgres:your-password@db.xyzabc.supabase.co:5432/postgres"
JWT_SECRET="your-secure-jwt-secret"
```

## Troubleshooting
- **Connection errors**: Check your DATABASE_URL is correct
- **Migration errors**: Ensure your Prisma schema is compatible with PostgreSQL 15
- **Auth errors**: Verify JWT_SECRET is set in both local .env and GitHub secrets