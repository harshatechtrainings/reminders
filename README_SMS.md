# 📱 SMS Notification Bot with Twilio & Vercel

A simple SMS notification bot that sends daily automated messages using Twilio SMS API and Vercel's cron jobs. Runs on Vercel's **free Hobby plan** and includes a React test UI for manual message testing.

## 🎯 Features

- ✅ Daily automated SMS messages at 09:00 UTC (2:30 PM IST)
- ✅ Twilio SMS API integration (much simpler than WhatsApp!)
- ✅ No template approval needed - send any custom message
- ✅ Vercel serverless functions
- ✅ Cron job scheduling
- ✅ React test UI for manual testing
- ✅ Environment variable configuration
- ✅ Free trial with $15 credit from Twilio

## 📋 Prerequisites

1. **Twilio Account** (free trial) - [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Vercel Account** (free tier) - [vercel.com](https://vercel.com)
3. **Node.js** installed locally (for development)

## 🔧 Twilio Setup (5 Minutes)

### Step 1: Create Twilio Account

1. Go to [Twilio Sign Up](https://www.twilio.com/try-twilio)
2. Sign up for a free trial ($15 credit)
3. Verify your email and phone number

### Step 2: Get a Twilio Phone Number

1. Log in to [Twilio Console](https://console.twilio.com)
2. Go to **Phone Numbers** → **Manage** → **Buy a number**
3. Search for a number with **SMS** capability
4. Buy/Get the number (free on trial)
5. Copy your Twilio phone number (e.g., `+15551234567`)

### Step 3: Get Your Credentials

You need these 4 values from [Twilio Console](https://console.twilio.com):

#### 1. **TWILIO_ACCOUNT_SID**
- Found on the Console Dashboard
- Starts with `AC...`
- Example: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 2. **TWILIO_AUTH_TOKEN**
- Found on the Console Dashboard (click "Show" to reveal)
- Keep this secret!
- Example: `your_auth_token_here`

#### 3. **TWILIO_PHONE_NUMBER**
- Your Twilio phone number from Step 2
- Must include country code with `+`
- Example: `+15551234567`

#### 4. **RECIPIENT**
- The phone number to receive SMS
- Must include country code with `+`
- Example: `+919876543210` (India), `+15551234567` (US)
- **Trial accounts can only send to verified numbers**

### Step 4: Verify Recipient Number (Trial Account Only)

For trial accounts, you must verify the recipient:

1. Go to Console → **Phone Numbers** → **Manage** → **Verified Caller IDs**
2. Click **+ Add a new Caller ID**
3. Enter the recipient number
4. Verify via phone call or SMS

**Note**: Once you upgrade your Twilio account, you can send to any number without verification.

## 🚀 Deployment on Vercel

### Step 1: Prepare Your Project

Your project structure should look like:

```
my-whatsapp-bot/
├── api/
│   └── sms-send.js
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── vercel.json
└── README_SMS.md
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI

```bash
# Navigate to project directory
cd my-whatsapp-bot

# Install dependencies
npm install

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect the project settings
5. Click **"Deploy"**

### Step 3: Configure Environment Variables

1. Go to your project on Vercel Dashboard
2. Navigate to **Settings > Environment Variables**
3. Add these variables:

| Variable Name          | Value Example         | Required |
|------------------------|-----------------------|----------|
| `TWILIO_ACCOUNT_SID`   | `ACxxxxxx...`         | Yes      |
| `TWILIO_AUTH_TOKEN`    | `your_token`          | Yes      |
| `TWILIO_PHONE_NUMBER`  | `+15551234567`        | Yes      |
| `RECIPIENT`            | `+919876543210`       | Yes      |
| `MESSAGE_TEXT`         | `Daily update ✅`     | No       |

4. Click **"Save"**
5. Redeploy your project:
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment
   - Click **"Redeploy"**

### Step 4: Enable Cron Jobs

#### For Vercel Free Plan: Use External Cron Service

Vercel Cron requires Pro plan ($20/month). For free plan, use:

**Option 1: cron-job.org (Recommended - Free)**

1. Sign up at [cron-job.org](https://cron-job.org)
2. Create new cron job:
   - **URL**: `https://your-app.vercel.app/api/sms-send`
   - **Schedule**: Daily at 09:00 UTC
   - **Method**: GET or POST
3. Enable and save

**Option 2: GitHub Actions (Free)**

Create `.github/workflows/daily-sms.yml`:

```yaml
name: Daily SMS Notification

on:
  schedule:
    - cron: '0 9 * * *'  # 09:00 UTC daily

jobs:
  send-sms:
    runs-on: ubuntu-latest
    steps:
      - name: Send SMS
        run: |
          curl -X POST https://your-app.vercel.app/api/sms-send
```

**Option 3: Vercel Pro Plan**

If you have Vercel Pro, the cron configuration in `vercel.json` will work automatically.

## 🧪 Testing

### Test via Web UI

1. Open your deployed URL: `https://your-app.vercel.app`
2. Click **"Send Test SMS Now"**
3. Check your phone for the SMS
4. View the response in the UI

### Test via API (cURL)

```bash
curl -X POST https://your-app.vercel.app/api/sms-send
```

### Test Locally

```bash
# Navigate to project
cd my-whatsapp-bot

# Install dependencies
npm install

# Copy and edit .env.template to .env
cp .env.template .env
nano .env  # Add your Twilio credentials

# Run test script
npm test
# or
npm run test:sms
# or
node test-sms.js
```

The test script will:
- ✅ Validate all environment variables
- ✅ Send a test SMS
- ✅ Show detailed success/error messages
- ✅ Provide troubleshooting tips

## 📁 Project Structure

```
my-whatsapp-bot/
│
├── api/
│   └── sms-send.js            # Serverless function for sending SMS
│
├── src/
│   ├── App.jsx                # React component for testing UI
│   ├── App.css                # Styles for the test UI
│   ├── index.js               # React entry point
│   └── index.css              # Global styles
│
├── public/
│   └── index.html             # HTML template
│
├── package.json               # Dependencies and scripts
├── vercel.json                # Vercel configuration (routing + cron)
├── test-sms.js                # Local testing script
├── .env.template              # Environment variables template
├── .gitignore                 # Git ignore file
└── README_SMS.md              # This file
```

## 🔍 How It Works

### 1. API Endpoint (`/api/sms-send`)

The serverless function:
- Reads environment variables from Vercel
- Validates all required variables
- Constructs SMS payload using Twilio API
- Sends the SMS via Twilio
- Returns the API response as JSON

### 2. Cron Job

- Triggers the API endpoint daily at 09:00 UTC (2:30 PM IST)
- Can use external cron service (cron-job.org) or Vercel Pro
- No manual intervention required

### 3. React Test UI

- Provides a button to manually trigger SMS
- Displays success/error responses
- Shows all required environment variables
- Useful for testing before cron deployment

## 🐛 Troubleshooting

### Error: "Missing required environment variables"

**Solution**: Make sure all 4 environment variables are set in Vercel:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `RECIPIENT`

### Error Code 21608: "Trial account restriction"

**Solution**: Trial accounts can only send to verified numbers:
1. Go to Twilio Console → **Verified Caller IDs**
2. Add and verify the recipient number
3. Or upgrade your Twilio account to send to any number

### Error Code 21211: "Invalid 'To' phone number"

**Solution**: 
- Phone number must be in E.164 format
- Include country code with `+` sign
- Example: `+919876543210` (not `919876543210`)

### Error Code 21606: "Invalid 'From' phone number"

**Solution**:
- Use a valid Twilio phone number from your account
- Go to Console → **Phone Numbers** → **Manage** → **Active numbers**
- Copy the exact number with `+` sign

### Error Code 20003: "Authentication error"

**Solution**:
- Check your Account SID and Auth Token
- Make sure there are no extra spaces
- Regenerate Auth Token if needed

### SMS not received

**Possible causes**:
1. Trial account sending to unverified number → Verify the number
2. Number blocked by carrier → Try a different number
3. Insufficient Twilio balance → Check your balance
4. Wrong recipient format → Use E.164 format with `+`

## 📝 Customizing the Message

Change the message in two ways:

### Option 1: Environment Variable (Recommended)

Set `MESSAGE_TEXT` in Vercel environment variables:

```
MESSAGE_TEXT=Your custom daily reminder! 🎉
```

### Option 2: Edit the Code

Modify `api/sms-send.js`:

```javascript
const MESSAGE_TEXT = process.env.MESSAGE_TEXT || 'Your custom default message here!';
```

## 💰 Pricing

### Twilio Costs (After Free Trial)

- **SMS (US/Canada)**: ~$0.0079 per message
- **SMS (India)**: ~$0.0063 per message
- **SMS (Other)**: Varies by country

For daily messages:
- **30 messages/month**: ~$0.24
- **365 messages/year**: ~$2.88

### Vercel Costs

- **Free (Hobby) Plan**: $0/month
  - Unlimited deployments
  - 100 GB bandwidth
  - No cron jobs (use external service)

- **Pro Plan**: $20/month
  - Everything in Free
  - Built-in cron jobs
  - Better analytics

## 🔒 Security Best Practices

1. **Never commit** your Auth Token or credentials to Git
2. Always use environment variables
3. Regenerate Auth Token if exposed
4. Use `.gitignore` to exclude `.env` file
5. Restrict Vercel environment variables to production only
6. Monitor usage in Twilio Console

## 🎓 Twilio Free Trial Limitations

- ✅ $15 free credit
- ✅ Fully functional API
- ⚠️ Can only send to verified numbers
- ⚠️ SMS may include "Sent from a Twilio trial account" prefix

**To remove limitations**: Upgrade your account (no monthly fee, just pay per message)

## 📚 Resources

- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio Console](https://console.twilio.com)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## 🤝 Support

If you encounter issues:

1. Check Vercel function logs for errors
2. Verify all environment variables are set correctly
3. Test the API endpoint manually using cURL
4. Check Twilio Console for SMS logs
5. Ensure recipient number is verified (trial accounts)
6. Run `npm test` locally to debug

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Built with ❤️ for automated SMS notifications**

Happy texting! 🚀 📱

