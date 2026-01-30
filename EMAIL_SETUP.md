# 📧 Email Setup Guide for MerryMaker

MerryMaker needs email credentials to send Christmas card notifications to recipients. This guide will help you set up Gmail to work with the application.

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication

Gmail App Passwords require 2FA to be enabled first.

1. Go to: **https://myaccount.google.com/security**
2. Scroll down to "How you sign in to Google"
3. Click on **"2-Step Verification"**
4. If not enabled, click **"Get Started"** and follow the setup
5. Complete the 2FA setup (you'll need your phone)

### Step 2: Generate an App Password

1. Go to: **https://myaccount.google.com/apppasswords**
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. You may need to sign in again
3. Under "Select app", choose **"Mail"**
4. Under "Select device", choose **"Other (Custom name)"**
5. Type: **"MerryMaker"**
6. Click **"Generate"**
7. Google will show you a 16-character password like: `abcd efgh ijkl mnop`
8. **Copy this password** (remove the spaces)

### Step 3: Update Your .env File

Open `MerryMaker/backend/.env` and update these lines:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=MerryMaker <your.email@gmail.com>
```

**Replace:**
- `your.email@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with the 16-character app password (no spaces!)

**Example:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tyler.kirkland@gmail.com
EMAIL_PASSWORD=xyzw abcd efgh ijkl
EMAIL_FROM=MerryMaker <tyler.kirkland@gmail.com>
```

### Step 4: Restart the Backend

```bash
# Stop the backend (Ctrl+C)
cd MerryMaker/backend
npm run dev
```

### Step 5: Test Sending a Card

1. Log in as CEO
2. Select a recipient
3. Write a message
4. Click "Send Christmas Card"
5. Check the recipient's email!

## Alternative: Use a Different Email Provider

If you don't want to use Gmail, you can use other providers:

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your.email@outlook.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=MerryMaker <your.email@outlook.com>
```

### Yahoo Mail

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your.email@yahoo.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=MerryMaker <your.email@yahoo.com>
```

### Custom SMTP Server

```env
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_USER=your.email@yourprovider.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=MerryMaker <your.email@yourprovider.com>
```

## Troubleshooting

### Error: "Username and Password not accepted"

**Causes:**
- Using your regular Gmail password instead of an App Password
- 2FA not enabled on Gmail
- Incorrect email address
- Spaces in the app password

**Solutions:**
1. Make sure 2FA is enabled on your Google account
2. Generate a new App Password
3. Copy the password without spaces
4. Update `.env` file
5. Restart the backend

### Error: "Connection timeout"

**Causes:**
- Firewall blocking port 587
- Incorrect SMTP host
- Network issues

**Solutions:**
1. Check your firewall settings
2. Try port 465 with `secure: true` in the code
3. Check your internet connection

### Error: "Self-signed certificate"

**Solution:**
Add this to `backend/src/services/emailService.ts`:

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false  // Add this line
  }
});
```

### Emails Going to Spam

**Solutions:**
1. Ask recipients to check their spam folder
2. Add your email to their contacts
3. Use a verified domain email (not Gmail) in production
4. Set up SPF and DKIM records (advanced)

## Testing Email Configuration

You can test if your email is configured correctly:

### Option 1: Send a Test Card

Just try sending a Christmas card through the app!

### Option 2: Use a Test Script

Create `backend/test-email.js`:

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: process.env.EMAIL_USER, // Send to yourself
  subject: 'Test Email from MerryMaker',
  text: 'If you receive this, your email is configured correctly!',
}, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Success! Email sent:', info.messageId);
  }
});
```

Run it:
```bash
cd backend
node test-email.js
```

## Security Best Practices

✅ **DO:**
- Use App Passwords, not your main password
- Keep your App Password secret
- Use environment variables
- Revoke unused App Passwords

❌ **DON'T:**
- Commit `.env` file to Git
- Share your App Password
- Use your main Gmail password
- Reuse App Passwords across projects

## Revoking an App Password

If you need to revoke an App Password:

1. Go to: https://myaccount.google.com/apppasswords
2. Find "MerryMaker" in the list
3. Click the trash icon to revoke it
4. Generate a new one if needed

## Production Considerations

For production deployment, consider:

1. **Use a dedicated email service:**
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

2. **Benefits:**
   - Better deliverability
   - Higher sending limits
   - Detailed analytics
   - Professional appearance

3. **Gmail Limits:**
   - 500 emails per day
   - May be flagged as spam
   - Not ideal for high volume

---

📧 You're all set to send Christmas cards via email! 🎄
