# 🎄 MerryMaker - Local Development Setup (Without Docker)

This guide will help you run the MerryMaker application locally without using Docker.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 15+** - [Download here](https://www.postgresql.org/download/)
- **Git** (optional, for cloning)

## Step-by-Step Setup

### 1. Install PostgreSQL

#### Windows:
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is 5432 (keep this)

#### Mac (using Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

Open a terminal/command prompt and run:

#### Windows:
```bash
# Open PostgreSQL command line
psql -U postgres

# In psql, run these commands:
CREATE DATABASE merrymaker;
CREATE USER merrymaker WITH PASSWORD 'merrymaker_dev_password';
GRANT ALL PRIVILEGES ON DATABASE merrymaker TO merrymaker;
\q
```

#### Mac/Linux:
```bash
# Switch to postgres user
sudo -u postgres psql

# In psql, run these commands:
CREATE DATABASE merrymaker;
CREATE USER merrymaker WITH PASSWORD 'merrymaker_dev_password';
GRANT ALL PRIVILEGES ON DATABASE merrymaker TO merrymaker;
\q
```

### 3. Configure Environment Variables

Navigate to the MerryMaker folder and create a `.env` file:

```bash
cd MerryMaker
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
# Database Configuration
DATABASE_URL=postgresql://merrymaker:merrymaker_dev_password@localhost:5432/merrymaker

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_random_session_secret_change_this_in_production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# CEO Email (this user gets special admin interface)
CEO_EMAIL=your_ceo_email@example.com

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (for Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=MerryMaker <your_email@gmail.com>
```

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Click "Create"
5. Copy the Client ID and Client Secret to your `.env` file

### 5. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 6. Setup Gmail for Email Sending

1. Enable 2-Factor Authentication on your Gmail account
2. Go to your Google Account → Security
3. Under "2-Step Verification", scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy this password to `EMAIL_PASSWORD` in your `.env` file

### 7. Install Backend Dependencies

Open a terminal in the MerryMaker folder:

```bash
cd backend
npm install
```

This will install all required packages including:
- express
- knex
- pg (PostgreSQL client)
- passport
- openai
- nodemailer
- sharp
- and more...

### 8. Run Database Migrations

Still in the `backend` folder:

```bash
npm run migrate:latest
```

You should see output like:
```
Batch 1 run: 2 migrations
```

This creates the `users` and `christmas_cards` tables in your database.

### 9. Start the Backend Server

In the `backend` folder:

```bash
npm run dev
```

You should see:
```
Server is running on port 3001
Frontend URL: http://localhost:3000
CEO Email: your_ceo_email@example.com
```

**Keep this terminal window open!** The backend server needs to stay running.

### 10. Install Frontend Dependencies

Open a **NEW** terminal window and navigate to the frontend folder:

```bash
cd MerryMaker/frontend
npm install
```

This will install:
- react
- react-dom
- react-router-dom
- axios
- typescript
- and more...

### 11. Start the Frontend Development Server

Still in the `frontend` folder:

```bash
npm start
```

The React development server will start and automatically open your browser to:
```
http://localhost:3000
```

**Keep this terminal window open too!**

## You're Ready! 🎉

You should now have:
- ✅ PostgreSQL database running
- ✅ Backend API running on http://localhost:3001
- ✅ Frontend React app running on http://localhost:3000
- ✅ Browser opened to the login page

## Testing the Application

### Test as Regular User:
1. Click "Sign in with Google"
2. Authorize the application
3. Upload a selfie
4. Set your word (e.g., "Joy")

### Test as CEO:
1. Log in with the email you set as `CEO_EMAIL`
2. You'll see the CEO dashboard instead
3. Upload your selfie
4. Select a user who has uploaded their picture and word
5. Write a message and send a card!

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
- Make sure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Verify the database and user were created correctly

### Issue: "Port 3000 is already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Port 3001 is already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Issue: Google OAuth redirect error
**Solution:**
- Verify the redirect URI in Google Cloud Console is exactly: `http://localhost:3001/auth/google/callback`
- Make sure `FRONTEND_URL` in `.env` is `http://localhost:3000`

### Issue: Email not sending
**Solution:**
- Verify you're using a Gmail App Password, not your regular password
- Check that 2FA is enabled on your Gmail account
- Try generating a new app password

### Issue: Images not uploading
**Solution:**
- The `backend/uploads` folder will be created automatically
- Make sure you have write permissions in the backend folder

### Issue: Migration errors
**Solution:**
```bash
# Rollback migrations
cd backend
npm run migrate:rollback

# Run migrations again
npm run migrate:latest
```

## Stopping the Application

1. In the frontend terminal: Press `Ctrl+C`
2. In the backend terminal: Press `Ctrl+C`
3. PostgreSQL can keep running in the background

## Restarting the Application

You only need to repeat steps 9 and 11:

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

## Development Tips

### View Database Contents

```bash
# Connect to database
psql -U merrymaker -d merrymaker

# View users
SELECT * FROM users;

# View cards
SELECT * FROM christmas_cards;

# Exit
\q
```

### Clear Database and Start Fresh

```bash
cd backend
npm run migrate:rollback
npm run migrate:latest
```

### Check Backend Logs

The backend terminal will show all API requests and errors in real-time.

### Check Frontend Logs

Open browser Developer Tools (F12) → Console tab to see frontend logs.

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Changes to React files automatically refresh the browser
- **Backend**: Changes to TypeScript files automatically restart the server (thanks to nodemon)

## File Structure for Local Development

```
MerryMaker/
├── backend/
│   ├── uploads/              # Created automatically - stores uploaded images
│   ├── src/                  # Source code
│   ├── node_modules/         # Dependencies (created by npm install)
│   └── package.json
├── frontend/
│   ├── src/                  # React source code
│   ├── public/               # Static files
│   ├── node_modules/         # Dependencies (created by npm install)
│   └── package.json
└── .env                      # Your environment variables (create this)
```

## Next Steps

- Customize the styling in the CSS files
- Add more features to the application
- Deploy to a production server when ready

---

🎄 Happy Coding! 🎄
