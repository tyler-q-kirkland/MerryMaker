# 🔐 Google OAuth Setup Guide for MerryMaker

This detailed guide will walk you through setting up Google OAuth authentication for the MerryMaker application.

## What is Google OAuth?

Google OAuth allows users to sign in to your application using their Google account, without you having to manage passwords. It's secure, convenient, and trusted by users.

## Step-by-Step Setup

### Step 1: Access Google Cloud Console

1. Open your web browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account (any Gmail account works)
3. If this is your first time, you may need to accept the Terms of Service

### Step 2: Create a New Project

1. At the top of the page, click on the **project dropdown** (it might say "Select a project" or show a current project name)
2. Click **"NEW PROJECT"** in the top-right corner of the dialog
3. Fill in the project details:
   - **Project name**: `MerryMaker` (or any name you prefer)
   - **Organization**: Leave as "No organization" (unless you have one)
4. Click **"CREATE"**
5. Wait a few seconds for the project to be created
6. Make sure your new project is selected in the project dropdown at the top

### Step 3: Enable Google+ API

Google OAuth requires the Google+ API to be enabled.

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or use the search bar at the top and search for "API Library"
2. In the API Library search box, type: **"Google+ API"**
3. Click on **"Google+ API"** from the results
4. Click the blue **"ENABLE"** button
5. Wait for it to enable (takes a few seconds)

### Step 4: Configure OAuth Consent Screen

Before creating credentials, you need to configure the OAuth consent screen (what users see when they log in).

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account, then you can choose Internal)
3. Click **"CREATE"**

#### Fill in the OAuth Consent Screen:

**App Information:**
- **App name**: `MerryMaker`
- **User support email**: Select your email from the dropdown
- **App logo**: (Optional - you can skip this for development)

**App Domain (Optional for development):**
- You can leave these blank for now

**Developer contact information:**
- **Email addresses**: Enter your email address

4. Click **"SAVE AND CONTINUE"**

#### Scopes (Step 2):
1. Click **"ADD OR REMOVE SCOPES"**
2. In the filter box, search for: `email` and `profile`
3. Check these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
4. Click **"UPDATE"**
5. Click **"SAVE AND CONTINUE"**

#### Test Users (Step 3):
1. Click **"ADD USERS"**
2. Add your email address (and any other emails you want to test with)
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

#### Summary (Step 4):
1. Review your settings
2. Click **"BACK TO DASHBOARD"**

### Step 5: Create OAuth 2.0 Credentials

Now you'll create the actual credentials (Client ID and Client Secret).

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. At the top, click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**

#### Configure OAuth Client:

1. **Application type**: Select **"Web application"**

2. **Name**: `MerryMaker Web Client` (or any name you prefer)

3. **Authorized JavaScript origins**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:3000`
   - Click **"+ ADD URI"** again
   - Enter: `http://localhost:3001`

4. **Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:3001/auth/google/callback`
   - ⚠️ **IMPORTANT**: This must be EXACT - no trailing slash!

5. Click **"CREATE"**

### Step 6: Copy Your Credentials

A dialog will appear with your credentials:

1. **Client ID**: A long string like `123456789-abc123def456.apps.googleusercontent.com`
   - Click the **copy icon** to copy it
   - Paste it into your `.env` file as `GOOGLE_CLIENT_ID`

2. **Client Secret**: A shorter string like `GOCSPX-abc123def456`
   - Click the **copy icon** to copy it
   - Paste it into your `.env` file as `GOOGLE_CLIENT_SECRET`

3. Click **"OK"** to close the dialog

### Step 7: Update Your .env File

Open your `.env` file in the MerryMaker folder and update these lines:

```env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
```

Replace the example values with your actual credentials from Step 6.

## Visual Guide

Here's what you're looking for at each step:

### Finding the Credentials Page:
```
Google Cloud Console
└── APIs & Services (left sidebar)
    └── Credentials
        └── + CREATE CREDENTIALS (top button)
            └── OAuth client ID
```

### The Redirect URI Must Be Exact:
```
✅ CORRECT: http://localhost:3001/auth/google/callback
❌ WRONG:   http://localhost:3001/auth/google/callback/
❌ WRONG:   https://localhost:3001/auth/google/callback
❌ WRONG:   http://localhost:3000/auth/google/callback
```

## Testing Your Setup

### 1. Start Your Application

Make sure both backend and frontend are running:

**Terminal 1 (Backend):**
```bash
cd MerryMaker/backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd MerryMaker/frontend
npm start
```

### 2. Test the Login Flow

1. Open your browser to: `http://localhost:3000`
2. Click **"Sign in with Google"**
3. You should see a Google login page
4. Sign in with your Google account
5. You may see a warning: **"Google hasn't verified this app"**
   - This is normal for development!
   - Click **"Advanced"** → **"Go to MerryMaker (unsafe)"**
6. Review the permissions and click **"Continue"**
7. You should be redirected back to your app and logged in!

## Common Issues & Solutions

### Issue: "Error 400: redirect_uri_mismatch"

**Cause**: The redirect URI in your code doesn't match what's in Google Cloud Console.

**Solution**:
1. Go back to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", verify it shows exactly:
   ```
   http://localhost:3001/auth/google/callback
   ```
4. If not, edit it and save
5. Wait 5 minutes for changes to propagate
6. Try again

### Issue: "Error 401: invalid_client"

**Cause**: Your Client ID or Client Secret is incorrect.

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Copy the Client ID and Client Secret again
4. Update your `.env` file
5. Restart your backend server (`Ctrl+C` then `npm run dev`)

### Issue: "Access blocked: This app's request is invalid"

**Cause**: The OAuth consent screen isn't configured properly.

**Solution**:
1. Go to Google Cloud Console → OAuth consent screen
2. Make sure you've added your email as a test user
3. Make sure the app is in "Testing" mode (not "In production")
4. Try logging in again

### Issue: "Google hasn't verified this app" warning

**This is normal for development!**

**Solution**:
- Click "Advanced" → "Go to MerryMaker (unsafe)"
- This warning appears because your app isn't verified by Google
- For production, you would need to submit your app for verification
- For development/testing, you can safely proceed

### Issue: Can't find the OAuth consent screen

**Solution**:
1. Make sure you've selected your project at the top of the page
2. Go to: APIs & Services → OAuth consent screen
3. If you see "Configure Consent Screen", click it
4. Choose "External" and follow the steps above

## For Production Deployment

When you're ready to deploy to production:

### 1. Add Production Redirect URIs

1. Go to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://yourdomain.com/auth/google/callback
   ```
4. Update your production `.env` file with the same credentials

### 2. Verify Your App (Optional but Recommended)

For a production app, you should verify it with Google:

1. Go to OAuth consent screen
2. Click "PUBLISH APP"
3. Submit for verification (Google will review your app)
4. This removes the "unverified app" warning for users

## Security Best Practices

✅ **DO:**
- Keep your Client Secret private (never commit to Git)
- Use environment variables for credentials
- Use HTTPS in production
- Regularly rotate your Client Secret

❌ **DON'T:**
- Share your Client Secret publicly
- Commit `.env` file to version control
- Use the same credentials for development and production
- Hardcode credentials in your source code

## Quick Reference

### Where to Find Things in Google Cloud Console:

| What You Need | Where to Find It |
|---------------|------------------|
| Create Project | Top bar → Project dropdown → NEW PROJECT |
| Enable APIs | APIs & Services → Library |
| OAuth Consent Screen | APIs & Services → OAuth consent screen |
| Create Credentials | APIs & Services → Credentials → CREATE CREDENTIALS |
| View/Edit Credentials | APIs & Services → Credentials → Click on credential name |

### Important URLs:

- **Google Cloud Console**: https://console.cloud.google.com/
- **API Library**: https://console.cloud.google.com/apis/library
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent

## Need Help?

If you're still having issues:

1. Double-check all redirect URIs are exact
2. Make sure you've enabled the Google+ API
3. Verify your credentials are copied correctly to `.env`
4. Restart your backend server after changing `.env`
5. Clear your browser cache and cookies
6. Try using an incognito/private browser window

---

🔐 You're all set with Google OAuth! 🎄
