# Vercel Production Setup Guide

## ℹ️ Simplified Setup

This app uses **Prisma Accelerate** for the database, which means both local development and production use the same database connection. No need for separate databases!

---

## Step 1: Verify Your Prisma Accelerate Setup

You should already have a Prisma Accelerate connection string in your local `.env` file:

```
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
```

If you need to create a new Prisma Accelerate database:
1. Go to https://console.prisma.io
2. Create a new project
3. Get your connection string (includes API key)

---

## Step 2: Add Environment Variables to Vercel

Go to your Vercel project dashboard:

1. Click on **Settings** tab
2. Click on **Environment Variables** in the sidebar
3. Add the following variables:

### Required Variables:

**Use the SAME values from your local `.env` file:**

```bash
# Database (Prisma Accelerate - same as local)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key

# UploadThing (same as local)
UPLOADTHING_TOKEN=eyJhcGlLZXkiOiJza19saXZlX2M4MjMzMzg1MThkMmQzMDNlZWM1OWZlNDIyNmE4YzE4ODY0MGVhNWNjOTdlZWE1NDNiNzBiNmRkYzg5YjdjZjMiLCJhcHBJZCI6Iml3dGNwMTE1aGQiLCJyZWdpb25zIjpbInNlYTEiXX0=

# reCAPTCHA (same as local)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdpQfcrAAAAAFouAW1h33JC1fc7dbN4Y4x4Vhbu
RECAPTCHA_SECRET_KEY=6LdpQfcrAAAAAAea9cDKZymZx_49MiCRYnTLO6Ja

# Session Secret (same as local)
SESSION_SECRET=a2gYet3hESWttRq7r4ynX6biczn0NEkwGXePynbYJQs=
```

💡 **Tip:** You can copy these directly from your local `.env` file!

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

## Step 4: Create Admin User (If Needed)

Since local and production share the same database, if you've already created an admin user locally, you can use those same credentials in production!

If you need to create an admin user, run locally:

```bash
npm run create-admin
```

This will create the admin user in your Prisma Accelerate database, which is used by both local and production environments.

---

## Step 5: Verify Deployment

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
