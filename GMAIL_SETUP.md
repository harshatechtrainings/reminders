# 📧 Gmail Setup Guide - Free Email Notifications

## 🎯 Why Gmail?

| Feature | SMS (Twilio) | Email (Gmail) |
|---------|--------------|---------------|
| **Cost** | ~$0.05/message | **FREE!** |
| **Setup** | Complex | Simple |
| **Limits** | Pay per message | 500/day free |
| **Rich content** | Text only | HTML, images |

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification**
3. Follow the steps to enable it (if not already enabled)

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other** → Enter "Pig Farm Reminders"
4. Click **Generate**
5. **Copy the 16-character password** (looks like: `xxxx xxxx xxxx xxxx`)

⚠️ **Important:** Save this password! You won't be able to see it again.

### Step 3: Add Environment Variables

#### For Local Testing (.env file):

```bash
# Gmail Configuration
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
NOTIFICATION_EMAIL=recipient@example.com
```

#### For Vercel (Production):

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `GMAIL_USER` = your Gmail address
   - `GMAIL_APP_PASSWORD` = the 16-character app password
   - `NOTIFICATION_EMAIL` = where to send reminders

### Step 4: Test It!

```bash
npm run test:email
```

## 📧 Sample Emails

### Medication Reminder Email:

```
Subject: 💊 3 Medication(s) Today (2025-11-30)

🐷 Farm Medication Reminders
Date: 2025-11-30

📋 3 medication(s) scheduled for today

1. Pig 94 :7 Childs - Reminder Schedule
   📅 Age: 105 days (3 months, 15 days)
   💊 Medication: SWINE FEVER VACCINE
   🕐 Time: morning
   📝 Notes: SUBCUT, 1 ml, Brand: -

2. Pig 95 :8 Childs - Reminder Schedule
   ...
```

### No Medications Email:

```
Subject: ✅ Farm Update - No Medications Today (2025-11-30)

🐷 Farm Update - All Clear!
Date: 2025-11-30

✅ No medications scheduled today!

📊 Total Pigs: 6
💊 Medications Today: 0

🎉 Enjoy your day!
```

## 📝 Update vercel.json

Change the cron to use email instead of SMS:

```json
{
  "crons": [
    {
      "path": "/api/email-send",
      "schedule": "30 2 * * *"
    }
  ]
}
```

## 🔧 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GMAIL_USER` | ✅ | Your Gmail address | `yourname@gmail.com` |
| `GMAIL_APP_PASSWORD` | ✅ | App Password (16 chars) | `abcd efgh ijkl mnop` |
| `NOTIFICATION_EMAIL` | ✅ | Where to send emails | `farmer@example.com` |

## 💡 Tips

### Send to Multiple Recipients

Comma-separate emails:
```bash
NOTIFICATION_EMAIL=person1@gmail.com,person2@gmail.com
```

### Check Spam Folder

First few emails might go to spam. Mark as "Not Spam" to fix.

### Gmail Daily Limits

- Free Gmail: 500 emails/day
- Google Workspace: 2,000 emails/day

For a pig farm with daily reminders, 500/day is MORE than enough!

## 🛠️ Troubleshooting

### "Invalid login" Error

1. Make sure you're using **App Password**, not your regular password
2. Check if 2-Step Verification is enabled
3. Regenerate the App Password if needed

### "Less secure app access" Error

This is the OLD way. Use App Passwords instead (the new way).

### Emails Going to Spam

1. Add sender to contacts
2. Mark first email as "Not Spam"
3. Use a proper "From" name

### "EAUTH" Error

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution:** 
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Delete old app password
3. Generate new one
4. Update `GMAIL_APP_PASSWORD` in .env and Vercel

## 📊 Cost Comparison

| Scenario | SMS Cost | Email Cost | Savings |
|----------|----------|------------|---------|
| 1 reminder/day | $1.50/month | $0 | $1.50 |
| 5 reminders/day | $7.50/month | $0 | $7.50 |
| 20 reminders/day | $30/month | $0 | $30 |

## ✅ Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] `GMAIL_USER` set in .env
- [ ] `GMAIL_APP_PASSWORD` set in .env
- [ ] `NOTIFICATION_EMAIL` set in .env
- [ ] `npm run test:email` works
- [ ] Environment variables added to Vercel
- [ ] `vercel.json` cron path updated to `/api/email-send`

## 🚀 You're Done!

Your pig farm now gets **FREE email reminders** instead of paid SMS!

---

**Gmail Email Setup Complete! 📧 ✅ FREE forever! 💰**

