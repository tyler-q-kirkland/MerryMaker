# 🎄 MerryMaker - Christmas Card Generator

A full-stack web application for creating and sending personalized AI-generated Christmas cards. Built with React, Node.js, Express, PostgreSQL, and OpenAI.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- 👤 **User Profiles** - Upload selfies and set personal words
- 🎅 **CEO Dashboard** - Special interface for sending personalized cards
- 🤖 **AI-Generated Messages** - GPT-4 via OpenRouter creates festive greetings combining CEO messages with user words
- 🖼️ **AI-Generated Festive Images** - Nano Banana Pro via OpenRouter creates custom Christmas scenes with both people
- 📧 **Email Notifications** - Recipients receive email links to view their cards
- 🐳 **Dockerized** - Full Docker support for easy deployment
- 💻 **Local Development** - Can run locally without Docker

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js with Express
- TypeScript
- Knex.js for database migrations
- PostgreSQL database
- Passport.js with Google OAuth 2.0
- OpenRouter API with GPT-4 for AI-generated messages
- OpenRouter API with Nano Banana Pro for AI-generated festive images
- Sharp for image processing (fallback composite images)
- Nodemailer for email sending

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 15

## Prerequisites

- Node.js 18+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- Google OAuth credentials
- OpenRouter API key (for GPT-4 and Nano Banana Pro)
- Email account for sending notifications (Gmail recommended)

## Setup Instructions

### 1. Clone and Setup Environment

**Backend:**
```bash
cd MerryMaker/backend
cp .env.example .env
```

**Frontend:**
```bash
cd MerryMaker/frontend
cp .env.example .env
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):

```env
# Database
DATABASE_URL=postgresql://merrymaker:merrymaker_dev_password@localhost:5432/merrymaker

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_random_session_secret_here

# Google OAuth (Get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# CEO Email (this user gets admin interface)
CEO_EMAIL=ceo@yourcompany.com

# OpenRouter API (Get from https://openrouter.ai/)
# Used for both GPT-4 (messages) and Nano Banana Pro (images)
OPENROUTER_API_KEY=your_openrouter_api_key

# Email Configuration (for Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=MerryMaker <your_email@gmail.com>
```

**Frontend** (`frontend/.env`):

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# CEO Email (must match backend CEO_EMAIL)
REACT_APP_CEO_EMAIL=ceo@yourcompany.com
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
   - Your production URL + `/auth/google/callback` (production)
6. Copy Client ID and Client Secret to `.env`

### 4. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate an app password for "Mail"
4. Use this password in `EMAIL_PASSWORD` in `.env`

## Running with Docker (Recommended)

### Start all services:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend on port 3000

### Run database migrations:

```bash
docker-compose exec backend npm run migrate:latest
```

### View logs:

```bash
docker-compose logs -f
```

### Stop services:

```bash
docker-compose down
```

## Running Locally (Without Docker)

### 1. Start PostgreSQL

Make sure PostgreSQL is running locally on port 5432, or update `DATABASE_URL` in `.env`.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Run Database Migrations

```bash
cd backend
npx knex migrate:latest
```

### 4. (Optional) Seed Test Data

```bash
cd backend
npx knex seed:run
```

This will create 2 test users with sample data.

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:3001

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 6. Start Frontend Development Server

```bash
cd frontend
npm start
```

Frontend will run on http://localhost:3000

## Usage

### For Regular Users:

1. Navigate to http://localhost:3000
2. Click "Sign in with Google"
3. Upload your selfie
4. Set your special word (e.g., "Joy", "Peace", "Gratitude")
5. Wait for a Christmas card from the CEO!

### For CEO:

1. Log in with the email specified in `CEO_EMAIL`
2. Upload your selfie
3. Select a recipient from the list
4. Write a personal message
5. Click "Send Christmas Card"
6. AI will generate a festive message combining your message with the recipient's word
7. Recipient receives an email with a link to view their card

## Project Structure

```
MerryMaker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── passport.ts          # Google OAuth configuration
│   │   ├── migrations/
│   │   │   ├── *_create_users_table.ts
│   │   │   ├── *_create_christmas_cards_table.ts
│   │   │   └── *_add_card_sent_tracking.ts
│   │   ├── seeds/
│   │   │   └── test_users.ts        # Test data seeder
│   │   ├── routes/
│   │   │   ├── auth.ts              # Authentication routes
│   │   │   ├── users.ts             # User management routes
│   │   │   └── cards.ts             # Christmas card routes
│   │   ├── services/
│   │   │   ├── aiService.ts         # OpenAI integration
│   │   │   ├── emailService.ts      # Email sending
│   │   │   ├── imageService.ts      # Image processing
│   │   │   └── festiveCompositeService.ts  # Festive image composition
│   │   ├── db.ts                    # Database connection
│   │   └── index.ts                 # Express server
│   ├── .env                         # Backend environment variables (gitignored)
│   ├── .env.example                 # Backend environment template
│   ├── knexfile.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── CEODashboard.tsx
│   │   │   └── ChristmasCard.tsx
│   │   ├── services/
│   │   │   └── api.ts               # API client
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env                         # Frontend environment variables (gitignored)
│   ├── .env.example                 # Frontend environment template
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/word` - Update user's word
- `POST /api/users/picture` - Upload user's picture
- `GET /api/users/all` - Get all users (CEO only)

### Christmas Cards
- `POST /api/cards/send` - Send a Christmas card (CEO only)
- `GET /api/cards/:token` - View a Christmas card (public)
- `GET /api/cards/sent/all` - Get all sent cards (CEO only)

## Database Schema

### Users Table
- `id` - Primary key
- `email` - User email (unique)
- `google_id` - Google OAuth ID (unique)
- `name` - User's display name
- `picture_url` - Path to uploaded selfie
- `word` - User's special word
- `card_sent_this_season` - Boolean flag (tracks if user received a card)
- `created_at`, `updated_at` - Timestamps

### Christmas Cards Table
- `id` - Primary key
- `sender_id` - Foreign key to users (CEO)
- `recipient_id` - Foreign key to users
- `ceo_message` - Personal message from CEO
- `ai_generated_message` - AI-enhanced message
- `festive_image_url` - Path to composed festive image
- `card_token` - Unique token for card URL
- `viewed` - Boolean flag
- `viewed_at` - Timestamp when card was viewed
- `created_at`, `updated_at` - Timestamps

## Troubleshooting

### Google OAuth not working
- Verify redirect URIs in Google Cloud Console match exactly
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Ensure `FRONTEND_URL` is set correctly

### Email not sending
- Verify Gmail app password is correct
- Check that 2FA is enabled on Gmail account
- Try using a different SMTP provider if Gmail doesn't work

### Database connection errors
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Run migrations: `npm run migrate:latest`

### Images not displaying
- Check that uploads directory has write permissions
- Verify image paths in database are correct
- Ensure backend is serving static files from `/uploads`

## Production Deployment

1. Update environment variables for production
2. Set `NODE_ENV=production`
3. Use strong `SESSION_SECRET`
4. Configure proper CORS settings
5. Use HTTPS for all connections
6. Set up proper database backups
7. Configure email service for production
8. Update Google OAuth redirect URIs for production domain

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

---

🎄 Happy Holidays! 🎄
