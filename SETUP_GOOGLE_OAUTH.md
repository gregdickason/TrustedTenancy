# Google OAuth Setup for TrustedTenancy

This guide will help you set up Google OAuth authentication for the TrustedTenancy application.

## Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter project name: `TrustedTenancy` (or your preferred name)
4. Click "Create"

## Step 2: Enable Google OAuth API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google OAuth API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (for testing) or "Internal" (if you have a Google Workspace)
3. Fill in the required information:
   - **App name**: TrustedTenancy
   - **User support email**: Your email
   - **App logo**: (optional) Upload TrustedTenancy logo
   - **App domain**: `localhost:3000` (for development)
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. Add scopes (optional for basic setup)
6. Add test users if using "External" type:
   - Add your Google email address
   - Add any other emails you want to test with
7. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Configure the settings:
   - **Name**: TrustedTenancy OAuth Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
5. Click "Create"

## Step 5: Copy Credentials to .env File

1. After creation, you'll see a dialog with your credentials
2. Copy the **Client ID** and **Client Secret**
3. Open your `.env` file in the TrustedTenancy project
4. Update the following lines:

```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## Step 6: Restart the Application

1. Stop the development server (Ctrl+C)
2. Restart it: `npm run dev:with-db`
3. Test authentication by visiting: `http://localhost:3000/auth/signup`

## Troubleshooting

### Error: "Error occurred during sign-in"

1. **Check credentials**: Ensure both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly in `.env`
2. **Check redirect URI**: Ensure `http://localhost:3000/api/auth/callback/google` is in your Google OAuth settings
3. **Check consent screen**: Make sure you've added your test email if using "External" consent screen type
4. **Check logs**: Look in the `logs/` directory for detailed error information

### Error: "redirect_uri_mismatch"

- The redirect URI in Google OAuth settings doesn't match what NextAuth.js is sending
- Make sure you have `http://localhost:3000/api/auth/callback/google` (exactly) in your authorized redirect URIs

### Error: "access_blocked"

- Your email isn't added to the test users list in the OAuth consent screen
- Add your email to the test users list in Google Cloud Console

## Production Setup

For production deployment, you'll need to:

1. Update authorized origins to include your production domain
2. Update redirect URIs to include your production callback URL
3. Consider verifying your OAuth consent screen for public access
4. Update the `.env` file with production Google OAuth credentials

## Security Notes

- Keep your `GOOGLE_CLIENT_SECRET` private and secure
- Use environment variables for all sensitive data
- Consider using Google Workspace for internal applications
- Review and limit OAuth scopes to only what's necessary

## Support

If you encounter issues:

1. Check the console logs and `logs/auth-*.log` files
2. Verify all configuration steps above
3. Test with a different Google account
4. Check Google Cloud Console for any error messages