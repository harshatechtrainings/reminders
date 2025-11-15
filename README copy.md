# 📱 WhatsApp Cloud API Bot with Vercel Cron

A minimal WhatsApp bot that sends daily automated messages using WhatsApp Cloud API and Vercel's cron jobs. The bot runs on Vercel's **free Hobby plan** and includes a React test UI for manual message testing.

## 🎯 Features

- ✅ Daily automated WhatsApp messages at 09:00 UTC (2:30 PM IST)
- ✅ WhatsApp Cloud API integration
- ✅ Vercel serverless functions
- ✅ Cron job scheduling
- ✅ React test UI for manual testing
- ✅ Environment variable configuration
- ✅ Template message support with parameters

## 📋 Prerequisites

Before you begin, you need:

1. **Meta Developer Account** - [developers.facebook.com](https://developers.facebook.com)
2. **WhatsApp Business Account** set up on Meta
3. **Vercel Account** (free tier) - [vercel.com](https://vercel.com)
4. **Node.js** installed locally (for development)

## 🔧 WhatsApp Cloud API Setup

### Step 1: Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Click **"Create App"**
3. Select **"Business"** as the app type
4. Fill in app details and create the app

### Step 2: Add WhatsApp to Your App

1. In your app dashboard, click **"Add Product"**
2. Find **"WhatsApp"** and click **"Set up"**
3. Select or create a **WhatsApp Business Account**

### Step 3: Get Your Credentials

You'll need these 4 values:

#### 1. **WA_TOKEN** (Access Token)
- Go to WhatsApp > API Setup
- Copy the **Temporary access token** (24 hours)
- For production, create a **System User** and generate a permanent token:
  - Go to Business Settings > Users > System Users
  - Create a new system user
  - Assign the WhatsApp app to the user
  - Generate a token with `whatsapp_business_messaging` permission

#### 2. **PHONE_NUMBER_ID**
- Go to WhatsApp > API Setup
- Find **"Phone Number ID"** under the phone number
- Copy this ID (looks like: `1234567890123456`)

#### 3. **TEMPLATE_NAME**
- Go to WhatsApp > Message Templates
- Create a new template or use existing one
- Template example:
  ```
  Name: daily_update
  Category: Utility
  Language: English
  Body: Hello! Here's your {{1}} for today.
  ```
- Wait for Meta to approve your template
- Use the template name (e.g., `daily_update`)

#### 4. **RECIPIENT**
- The phone number to receive messages
- Format: E.164 (e.g., `919876543210` for India)
- Must be registered with WhatsApp
- During testing, only verified numbers can receive messages

### Step 4: Verify a Test Number (Development)

1. Go to WhatsApp > API Setup
2. Under **"To"**, click **"Manage phone number list"**
3. Add your phone number for testing
4. Verify via OTP

## 🚀 Deployment on Vercel

### Step 1: Prepare Your Project

1. Clone or download this project
2. Make sure all files are in place:
   ```
   my-whatsapp-bot/
   ├── api/
   │   └── whatsapp-send.js
   ├── public/
   │   └── index.html
   ├── src/
   │   ├── App.jsx
   │   ├── App.css
   │   ├── index.js
   │   └── index.css
   ├── package.json
   ├── vercel.json
   └── README.md
   ```

### Step 2: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 3: Deploy to Vercel

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
   - OR upload the folder directly
4. Vercel will auto-detect the project settings
5. Click **"Deploy"**

### Step 4: Configure Environment Variables

1. Go to your project on Vercel Dashboard
2. Navigate to **Settings > Environment Variables**
3. Add these 4 variables:

| Variable Name     | Value Example              | Description                           |
|-------------------|----------------------------|---------------------------------------|
| `WA_TOKEN`        | `EAAJ...your_token...`     | Permanent access token from Meta      |
| `PHONE_NUMBER_ID` | `1234567890123456`         | WhatsApp Business phone number ID     |
| `TEMPLATE_NAME`   | `daily_update`             | Your approved template name           |
| `RECIPIENT`       | `919876543210`             | Recipient phone (E.164 format)        |

4. Click **"Save"**
5. Redeploy your project for changes to take effect:
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment
   - Click **"Redeploy"**

### Step 5: Enable Cron Jobs (Pro Plan Required)

⚠️ **Important**: Vercel Cron Jobs require a **Pro plan** ($20/month).

For the **free Hobby plan**, you have these alternatives:

#### Alternative 1: Use External Cron Service (Free)

Use a free service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Sign up for the service
2. Create a new cron job
3. URL: `https://your-app.vercel.app/api/whatsapp-send`
4. Schedule: Daily at 09:00 UTC
5. Method: GET or POST

#### Alternative 2: GitHub Actions (Free)

Create `.github/workflows/daily-whatsapp.yml`:

```yaml
name: Daily WhatsApp Message

on:
  schedule:
    - cron: '0 9 * * *'  # 09:00 UTC daily

jobs:
  send-message:
    runs-on: ubuntu-latest
    steps:
      - name: Send WhatsApp Message
        run: |
          curl -X POST https://your-app.vercel.app/api/whatsapp-send
```

#### Alternative 3: Use Vercel Cron (Pro Plan)

If you have Vercel Pro:

1. The `vercel.json` file already includes cron configuration
2. Cron will automatically work after deployment
3. Monitor cron logs in Vercel Dashboard > Functions

## 🧪 Testing

### Test via Web UI

1. Open your deployed URL: `https://your-app.vercel.app`
2. You'll see the test interface
3. Click **"Send Test Message Now"**
4. Check if the WhatsApp message is received
5. View the response in the UI

### Test via API (cURL)

```bash
curl -X POST https://your-app.vercel.app/api/whatsapp-send
```

### Test Locally

```bash
# Install dependencies
npm install

# Create .env file with your variables
echo "WA_TOKEN=your_token" >> .env
echo "PHONE_NUMBER_ID=your_phone_id" >> .env
echo "TEMPLATE_NAME=your_template" >> .env
echo "RECIPIENT=your_recipient" >> .env

# Start development server
npm run dev

# The app will run on http://localhost:3000
```

## 📁 Project Structure

```
my-whatsapp-bot/
│
├── api/
│   └── whatsapp-send.js       # Serverless function for sending WhatsApp messages
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
├── .gitignore                 # Git ignore file
└── README.md                  # This file
```

## 🔍 How It Works

### 1. API Endpoint (`/api/whatsapp-send`)

The serverless function:
- Reads environment variables from Vercel
- Validates all required variables
- Constructs a WhatsApp template message payload
- Sends the message via WhatsApp Cloud API
- Returns the API response as JSON

### 2. Cron Job (Vercel or External)

- Triggers the API endpoint daily at 09:00 UTC (2:30 PM IST)
- No manual intervention required
- Automatic retry on failure (if using Vercel Pro)

### 3. React Test UI

- Provides a button to manually trigger messages
- Displays success/error responses
- Useful for testing before cron deployment

## 🐛 Troubleshooting

### Error: "Missing required environment variables"

**Solution**: Make sure all 4 environment variables are set in Vercel:
- `WA_TOKEN`
- `PHONE_NUMBER_ID`
- `TEMPLATE_NAME`
- `RECIPIENT`

### Error: "Access token expired"

**Solution**: The temporary token expires in 24 hours. Create a permanent token:
1. Go to Meta Business Settings
2. Create a System User
3. Generate a permanent token with `whatsapp_business_messaging` permission

### Error: "Template not found"

**Solution**: 
1. Make sure your template is approved by Meta
2. Use the exact template name (case-sensitive)
3. Wait for approval (can take a few hours)

### Error: "Recipient not allowed"

**Solution**: During development, you can only send to verified numbers:
1. Go to WhatsApp > API Setup
2. Add the recipient number to the verified list
3. For production, complete Business Verification

### Cron not working

**Solution**:
1. Vercel free plan doesn't support cron jobs
2. Use external cron service (cron-job.org) or GitHub Actions
3. Or upgrade to Vercel Pro plan

## 📝 Customizing the Message

To change the message content:

1. Update your WhatsApp template in Meta Dashboard
2. Modify the `components.parameters` in `api/whatsapp-send.js`:

```javascript
components: [
  {
    type: 'body',
    parameters: [
      {
        type: 'text',
        text: 'Your custom message here 🎉'  // Change this
      }
    ]
  }
]
```

## 🔒 Security Best Practices

1. **Never commit** your access tokens or credentials
2. Always use environment variables
3. Regenerate tokens if exposed
4. Use permanent tokens for production
5. Restrict token permissions to minimum required
6. Monitor API usage in Meta Dashboard

## 📚 Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Meta for Developers](https://developers.facebook.com)

## 🤝 Support

If you encounter issues:

1. Check the Vercel function logs
2. Verify all environment variables are set
3. Test the API endpoint manually
4. Check Meta Developer Console for API errors
5. Ensure your template is approved

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Built with ❤️ for automated WhatsApp messaging**

Happy messaging! 🚀



