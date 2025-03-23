# Deploying StudySync to Vercel

This guide will walk you through deploying your StudySync application to Vercel for free.

## Step-by-Step Deployment Process

### 1. Push your code to GitHub

If you haven't already, push your StudySync code to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Sign up for Vercel

- Go to [Vercel's website](https://vercel.com/)
- Click "Sign Up"
- Choose to sign up with GitHub

### 3. Import your GitHub repository

- From the Vercel dashboard, click "Add New..."
- Select "Project"
- Find and select your StudySync repository
- Click "Import"

### 4. Configure your project

In the configuration screen:
- Project Name: "studysync" (or your preferred name)
- Framework Preset: Vercel should automatically detect Vite
- Root Directory: Leave as `./ (root)`
- Build and Output Settings: These should be automatically filled in based on your vercel.json

### 5. Environment Variables

Click on "Environment Variables" and add:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

These values can be found in your Supabase dashboard under Project Settings > API.

### 6. Deploy

- Click "Deploy"
- Wait for the build to complete (usually takes about 1-2 minutes)

### 7. Configure Supabase for your new domain

Once deployed:

1. Copy your new deployment URL (e.g., `studysync-xyz123.vercel.app`)
2. Go to your Supabase dashboard
3. Navigate to Authentication > URL Configuration
4. Add your Vercel URL to the "Site URLs" list
5. Click "Save"

### 8. Test your deployment

Visit your Vercel deployment URL and test all features:
- User registration and login
- Creating study groups
- Uploading resources
- Scheduling sessions

## Troubleshooting

If you encounter issues:

1. **Deployment fails**: Check the build logs in Vercel dashboard
2. **Authentication issues**: Verify your Supabase Site URLs are set correctly
3. **API errors**: Ensure environment variables are correct
4. **Routing problems**: Confirm the rewrites in vercel.json are working

## Free Plan Limitations

On Vercel's free plan:
- No custom domains (only vercel.app subdomains)
- Limited analytics
- No password protection for preview deployments

These limitations should not affect your basic application functionality.
