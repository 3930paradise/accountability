# Vercel Production Setup Guide

## ⚠️ CRITICAL: Environment Variables Required

Your Vercel deployment is currently failing because the `DATABASE_URL` environment variable is not configured. Follow these steps to fix it.

---

## Step 1: Set Up Production Database

### Option A: Vercel Postgres (Recommended - Easiest)

1. Go to your Vercel project dashboard
2. Click on the **Storage** tab
3. Click **Create Database** → **Postgres**
4. Name it `paradise3930-db` (or any name you prefer)
5. Click **Create**
6. Vercel will automatically add `DATABASE_URL` to your environment variables

**That's it!** Skip to Step 3.

### Option B: Neon (Free PostgreSQL)

1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project named `paradise3930`
4. Copy the connection string (looks like: `postgresql://user:password@xyz.neon.tech/paradise3930`)
5. Continue to Step 2 to add it to Vercel

### Option C: Supabase (Free PostgreSQL)

1. Go to https://supabase.com
2. Sign up for a free account
3. Create a new project named `paradise3930`
4. Go to **Project Settings** → **Database**
5. Copy the **Connection String** (URI format)
6. Continue to Step 2 to add it to Vercel

---

## Step 2: Add Environment Variables to Vercel

Go to your Vercel project dashboard:

1. Click on **Settings** tab
2. Click on **Environment Variables** in the sidebar
3. Add the following variables:

### Required Variables:

```bash
# Database (from Step 1)
DATABASE_URL=postgresql://user:password@host:5432/database

# UploadThing (already configured)
UPLOADTHING_TOKEN=eyJhcGlLZXkiOiJza19saXZlX2M4MjMzMzg1MThkMmQzMDNlZWM1OWZlNDIyNmE4YzE4ODY0MGVhNWNjOTdlZWE1NDNiNzBiNmRkYzg5YjdjZjMiLCJhcHBJZCI6Iml3dGNwMTE1aGQiLCJyZWdpb25zIjpbInNlYTEiXX0=

# reCAPTCHA (already configured)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdpQfcrAAAAAFouAW1h33JC1fc7dbN4Y4x4Vhbu
RECAPTCHA_SECRET_KEY=6LdpQfcrAAAAAAea9cDKZymZx_49MiCRYnTLO6Ja

# Session Secret (generate new for production)
SESSION_SECRET=your_production_secret_here
```

**To generate a new SESSION_SECRET for production:**
```bash
openssl rand -base64 32
```

4. For each variable, set the environment to: **Production**, **Preview**, and **Development**
5. Click **Save**

---

## Step 3: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **⋮** menu on the latest deployment
3. Click **Redeploy**
4. Check the box for **Use existing Build Cache** (optional)
5. Click **Redeploy**

---

## Step 4: Initialize Production Database

After the deployment succeeds, you need to initialize the database schema:

### If using Vercel Postgres:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Pull environment variables:
```bash
vercel env pull
```

4. Push database schema:
```bash
npx prisma db push
```

### If using external database (Neon/Supabase):

Run this locally with your production DATABASE_URL:

```bash
DATABASE_URL="your_production_database_url" npx prisma db push
```

---

## Step 5: Create Admin User

You need an admin account to approve events and manage the site.

### Option A: Via Vercel CLI (if using Vercel Postgres)

```bash
vercel env pull
npm run create-admin
```

### Option B: Via Prisma Studio

1. Set your production DATABASE_URL temporarily:
```bash
export DATABASE_URL="your_production_database_url"
```

2. Open Prisma Studio:
```bash
npx prisma studio
```

3. Click on the **Admin** model
4. Click **Add record**
5. Generate a password hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```
6. Fill in:
   - **username**: your_admin_username
   - **passwordHash**: (paste the hash from above)
7. Click **Save**

---

## Step 6: Verify Deployment

1. Visit your production site URL
2. Try logging in at `/admin/login` with your admin credentials
3. Submit a test event at `/submit`
4. Approve it from `/admin`
5. Verify it appears on the homepage

---

## Troubleshooting

### Build Error: "Prisma schema validation failed"
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Redeploy after adding the variable

### Build Error: "Failed to collect page data"
- This is fixed in the latest commit (all API routes now use `force-dynamic`)
- Make sure you've pushed the latest changes

### Runtime Error: "Can't reach database server"
- Check that your DATABASE_URL is correct
- If using Neon/Supabase, make sure you copied the full connection string including password
- Verify the database is accessible (some require IP whitelisting)

### "No events showing on homepage"
- You need to submit events and approve them from `/admin`
- Events require admin approval before appearing publicly

---

## Quick Reference

**Production Site:** Check your Vercel deployment URL
**Admin Login:** `https://your-site.vercel.app/admin/login`
**Submit Event:** `https://your-site.vercel.app/submit`

**Database Provider Dashboards:**
- Vercel Postgres: https://vercel.com/dashboard → Your Project → Storage
- Neon: https://console.neon.tech
- Supabase: https://supabase.com/dashboard

---

## Next Steps After Deployment

1. **Custom Domain**: Add `3930paradise.com` in Vercel dashboard → Domains
2. **Admin Access**: Bookmark `/admin/login` and save your credentials securely
3. **Background Videos**: Upload damage videos via `/admin/videos`
4. **Event Moderation**: Regularly check `/admin` for pending submissions

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Create an issue: https://github.com/3930paradise/accountability/issues
