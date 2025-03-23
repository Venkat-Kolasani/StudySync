# Deployment Guide for StudySync

This guide will help you deploy the StudySync application to either Vercel or Netlify.

## Prerequisites

- A GitHub account
- Your StudySync repository pushed to GitHub
- Supabase environment variables

## Deploying to Vercel

1. **Sign up or log in to Vercel**
   - Go to [Vercel](https://vercel.com) and sign up or log in with your GitHub account.

2. **Import your repository**
   - Click on "Add New..." → "Project"
   - Select your StudySync repository from the list
  
3. **Configure project**
   - Project Name: `studysync` (or your preferred name)
   - Framework Preset: Select "Vite"
   - Root Directory: `./` (if your repository root is the project root)

4. **Environment Variables**
   - Add the following environment variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - Any other environment variables your project uses

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

6. **Custom Domain (optional)**
   - Once deployed, go to "Settings" → "Domains" to add a custom domain for your app

## Deploying to Netlify

1. **Sign up or log in to Netlify**
   - Go to [Netlify](https://netlify.com) and sign up or log in with your GitHub account.

2. **Import your repository**
   - Click on "Add new site" → "Import an existing project"
   - Connect to GitHub and select your StudySync repository

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   
4. **Environment Variables**
   - Go to "Site settings" → "Environment variables"
   - Add the following environment variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - Any other environment variables your project uses

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your application

6. **Custom Domain (optional)**
   - Once deployed, go to "Domain settings" to add a custom domain for your app

## Continuous Deployment

Both Vercel and Netlify offer continuous deployment. When you push changes to your GitHub repository, your site will automatically rebuild and redeploy.

## Handling CORS Issues

If you encounter CORS issues with Supabase, make sure to:

1. Go to your Supabase dashboard
2. Navigate to "Authentication" → "URL Configuration"
3. Add your Vercel/Netlify domain to the "Site URLs" list

## Troubleshooting

If you encounter any issues during deployment:

1. Check the deployment logs in your Vercel/Netlify dashboard
2. Make sure all environment variables are correctly set
3. Verify that your build command and publish directory are correct
4. Ensure you have the correct configuration files (vercel.json or netlify.toml) in your repository
