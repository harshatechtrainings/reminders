# 💊 Tablet Reminders System

Your SMS bot now automatically checks `reminders.json` daily and sends tablet reminders!

## 📋 How It Works

1. **Cron job triggers** at 09:00 UTC (2:30 PM IST)
2. **API checks** `reminders.json` for today's date
3. **If reminder exists** → Sends SMS with tablet info
4. **If no reminder** → Optionally sends default message or skips

## 📝 Reminder JSON Format

Edit `reminders.json` to add your tablet reminders:

```json
{
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "Vitamin D - 1000 IU",
      "time": "morning",
      "notes": "Take after breakfast"
    },
    {
      "date": "2025-11-16",
      "tablet": "Calcium - 500mg",
      "time": "evening",
      "notes": "Take with dinner"
    }
  ]
}
```

### Fields:

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `date` | ✅ Yes | Date in YYYY-MM-DD format | `"2025-11-15"` |
| `tablet` | ✅ Yes | Name and dosage of tablet | `"Vitamin D - 1000 IU"` |
| `time` | ✅ Yes | When to take it | `"morning"`, `"evening"` |
| `notes` | ✅ Yes | Additional instructions | `"Take after meal"` |

## 📱 SMS Format

When a reminder exists for today, the SMS will look like:

```
📋 Daily Reminder!

💊 Tablet: Vitamin D - 1000 IU
🕐 Time: morning
📝 Notes: Take after breakfast
```

## ⚙️ Configuration Options

### Environment Variables (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `SEND_DEFAULT_MESSAGE` | `true` | Send default message if no reminder |
| `MESSAGE_TEXT` | Default text | Used when no reminder found |

### Skip SMS on Days Without Reminders

Set this in Vercel environment variables:

```
SEND_DEFAULT_MESSAGE = false
```

This will skip sending SMS on days with no reminders in the JSON.

## 📅 Adding Reminders

### Quick Add (Command Line)

```bash
cd /Users/harshavardhan.reddy/Documents/Personal/Promotly/my-whatsapp-bot

# Edit reminders.json
nano reminders.json
```

Add your reminder:

```json
{
  "date": "2025-11-20",
  "tablet": "Your Tablet Name",
  "time": "morning",
  "notes": "Your instructions"
}
```

### Bulk Add for a Month

Example: Add vitamin reminders for every Monday in November:

```json
{
  "reminders": [
    {
      "date": "2025-11-04",
      "tablet": "Multivitamin",
      "time": "morning",
      "notes": "Take with water"
    },
    {
      "date": "2025-11-11",
      "tablet": "Multivitamin",
      "time": "morning",
      "notes": "Take with water"
    },
    {
      "date": "2025-11-18",
      "tablet": "Multivitamin",
      "time": "morning",
      "notes": "Take with water"
    },
    {
      "date": "2025-11-25",
      "tablet": "Multivitamin",
      "time": "morning",
      "notes": "Take with water"
    }
  ]
}
```

## 🧪 Testing

### Test Today's Reminder

```bash
# Check what reminder is scheduled for today
curl -X POST https://your-app.vercel.app/api/sms-send
```

### Test Specific Date (Temporarily)

Modify the date in `reminders.json` to today's date and redeploy.

## 🚀 Deployment

After editing `reminders.json`:

### Option 1: Git + Vercel (Automatic)

```bash
git add reminders.json
git commit -m "Update tablet reminders"
git push
```

Vercel will auto-deploy.

### Option 2: Manual Upload

1. Go to Vercel Dashboard
2. Go to your project
3. Upload updated `reminders.json`
4. Redeploy

### Option 3: Vercel CLI

```bash
vercel --prod
```

## 📊 Example Use Cases

### Daily Vitamin Routine

```json
{
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "Morning Stack: Vitamin D + B Complex",
      "time": "8:00 AM",
      "notes": "Take with breakfast and full glass of water"
    }
  ]
}
```

### Weekly Supplement

```json
{
  "reminders": [
    {
      "date": "2025-11-17",
      "tablet": "Omega-3 Fish Oil (Weekly dose)",
      "time": "Sunday morning",
      "notes": "1000mg EPA/DHA - Take with fatty meal"
    }
  ]
}
```

### Medicine Course

```json
{
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "Antibiotic - Day 1 of 7",
      "time": "Every 8 hours",
      "notes": "Started Nov 15. Complete full course!"
    },
    {
      "date": "2025-11-16",
      "tablet": "Antibiotic - Day 2 of 7",
      "time": "Every 8 hours",
      "notes": "Continue as prescribed"
    }
  ]
}
```

## 🔍 API Response Examples

### With Reminder

```json
{
  "success": true,
  "message": "SMS sent successfully",
  "date": "2025-11-15",
  "reminder": {
    "tablet": "Vitamin D - 1000 IU",
    "time": "morning",
    "notes": "Take after breakfast"
  },
  "recipient": "+918886968635",
  "messageId": "SM..."
}
```

### No Reminder (Skip Mode)

```json
{
  "success": true,
  "message": "No reminder for today",
  "date": "2025-11-15",
  "skipped": true
}
```

## 💡 Pro Tips

1. **Add reminders in advance** - Set up a whole month at once
2. **Use recurring patterns** - Copy/paste with date changes
3. **Include emoji** - Makes SMS more readable 💊 📋 ⏰
4. **Be specific** - Include dosage, time, and clear instructions
5. **Test first** - Add a test reminder for today before setting up many

## 🛠️ Troubleshooting

### "No reminder found" but JSON has today's date

- Check date format is exactly: `YYYY-MM-DD`
- Verify JSON is valid (use jsonlint.com)
- Check server timezone matches your expectations

### SMS not sending

- Check Vercel logs for errors
- Verify `reminders.json` is deployed
- Test API endpoint manually

### JSON syntax error

- Use a JSON validator before deploying
- Common issues: Missing commas, trailing commas, wrong quotes

---

**Your tablet reminders are now automated! 💊✅**

