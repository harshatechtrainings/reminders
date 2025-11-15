# 💊 Multi-Person Tablet Reminders System

Your SMS bot now automatically checks the `data/` folder daily and sends personalized tablet reminders to multiple people!

## 🆕 What's New?

- **Multi-person support** - Manage reminders for multiple people
- **Separate JSON files** - One file per person in `data/` folder
- **Personalized SMS** - Each person gets their own reminder with their name
- **Individual phone numbers** - No need for `.env` recipient, it's in each JSON file

## 📋 How It Works

1. **Cron job triggers** at 08:00 AM IST (02:30 UTC)
2. **API reads all JSON files** from `data/` folder
3. **Checks today's date** in each file's reminders
4. **Sends personalized SMS** to each person with a matching reminder
5. **Multiple people can get reminders** on the same day!

## 📁 Folder Structure

```
reminders/
├── data/
│   ├── harsha-reminders.json      ← Harsha's reminders
│   ├── family-reminders.json      ← Family member reminders
│   └── dad-reminders.json         ← Add more as needed!
├── api/
│   └── sms-send.js                ← Reads all data/*.json
├── test-sms.js                    ← Test sending SMS
└── test-reminder.js               ← Check today's reminders
```

## 📝 JSON File Format

Each file in `data/` folder should follow this structure:

```json
{
  "name": "Harsha",
  "phone": "+918886968635",
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

### Required Fields:

| Field | Level | Required | Format | Example |
|-------|-------|----------|--------|---------|
| `name` | Root | ✅ Yes | String | `"Harsha"` |
| `phone` | Root | ✅ Yes | E.164 (+country code) | `"+918886968635"` |
| `reminders` | Root | ✅ Yes | Array | See below |
| `date` | Reminder | ✅ Yes | YYYY-MM-DD | `"2025-11-15"` |
| `tablet` | Reminder | ✅ Yes | String | `"Vitamin D - 1000 IU"` |
| `time` | Reminder | ✅ Yes | String | `"morning"`, `"8:00 AM"` |
| `notes` | Reminder | ✅ Yes | String | `"Take after breakfast"` |

## 📱 SMS Format

When a reminder matches today's date, the person gets this personalized SMS:

```
📋 Hello Harsha!

💊 Tablet: Vitamin D - 1000 IU
🕐 Time: morning
📝 Notes: Take after breakfast
```

Notice the **name is personalized** 👆

## ➕ Adding a New Person

### Step 1: Create New JSON File

```bash
cd /Users/harshavardhan.reddy/Documents/Personal/Promotly/reminders/data

# Create new file (e.g., mom-reminders.json)
nano mom-reminders.json
```

### Step 2: Add Person's Details

```json
{
  "name": "Mom",
  "phone": "+919876543210",
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "Blood Pressure Medicine",
      "time": "morning",
      "notes": "Take with breakfast, check BP"
    }
  ]
}
```

### Step 3: Save and Deploy

```bash
git add data/mom-reminders.json
git commit -m "Add Mom's reminders"
git push
```

Done! 🎉 Mom will now get SMS reminders automatically.

## 📅 Adding Reminders for Existing Person

### Edit Their JSON File

```bash
cd /Users/harshavardhan.reddy/Documents/Personal/Promotly/reminders/data

# Edit Harsha's file
nano harsha-reminders.json
```

Add new reminder to the `reminders` array:

```json
{
  "name": "Harsha",
  "phone": "+918886968635",
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "Vitamin D - 1000 IU",
      "time": "morning",
      "notes": "Take after breakfast"
    },
    {
      "date": "2025-11-20",
      "tablet": "Calcium Supplement",
      "time": "evening",
      "notes": "Take with milk"
    }
  ]
}
```

## 🧪 Testing

### Test 1: Check Today's Reminders (No SMS Sent)

```bash
npm run test:reminder
```

Output shows who has reminders today:

```
✅ Found 2 Reminder(s) for Today!

═══════════════════════════════════
📄 File: harsha-reminders.json
👤 Name: Harsha
📞 Phone: +918886968635
💊 Tablet: Vitamin D - 1000 IU
🕐 Time: morning
📝 Notes: Take after breakfast

📱 SMS will be sent:
─────────────────────────────────
📋 Hello Harsha!

💊 Tablet: Vitamin D - 1000 IU
🕐 Time: morning
📝 Notes: Take after breakfast
─────────────────────────────────
```

### Test 2: Send Actual SMS (Real SMS!)

```bash
npm test
```

This will send SMS to everyone with a reminder for today!

### Test 3: Test via API

```bash
curl -X POST https://your-app.vercel.app/api/sms-send
```

## 🚀 Deployment

After adding/editing JSON files:

```bash
# Add all changed files
git add data/

# Commit with descriptive message
git commit -m "Update tablet reminders"

# Push to trigger auto-deploy
git push
```

Vercel will automatically redeploy with the new reminders.

## 📊 API Response (Multiple Recipients)

```json
{
  "success": true,
  "message": "Sent 2 SMS, 0 failed",
  "timestamp": "2025-11-15T02:30:00.000Z",
  "date": "2025-11-15",
  "totalReminders": 2,
  "successCount": 2,
  "failCount": 0,
  "results": [
    {
      "name": "Harsha",
      "phone": "+918886968635",
      "success": true,
      "messageId": "SM...",
      "status": "queued"
    },
    {
      "name": "Mom",
      "phone": "+919876543210",
      "success": true,
      "messageId": "SM...",
      "status": "queued"
    }
  ]
}
```

## 📋 Example Use Cases

### Family Medicine Management

```
data/
├── harsha-reminders.json    ← Your vitamins
├── mom-reminders.json       ← Mom's BP medicine
├── dad-reminders.json       ← Dad's diabetes medicine
└── grandma-reminders.json   ← Grandma's weekly supplements
```

Everyone gets their own personalized SMS!

### Multiple People, Same Day

If Harsha has a vitamin reminder and Mom has a BP medicine reminder on `2025-11-15`, **both will get SMS at 8:00 AM IST**!

### Weekly Supplements

```json
{
  "name": "Harsha",
  "phone": "+918886968635",
  "reminders": [
    {
      "date": "2025-11-17",
      "tablet": "Vitamin B12 (Weekly)",
      "time": "Sunday morning",
      "notes": "Once per week dose"
    },
    {
      "date": "2025-11-24",
      "tablet": "Vitamin B12 (Weekly)",
      "time": "Sunday morning",
      "notes": "Once per week dose"
    }
  ]
}
```

### Medicine Course (7 days)

```json
{
  "name": "Mom",
  "phone": "+919876543210",
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "Antibiotic - Day 1/7",
      "time": "Every 8 hours",
      "notes": "Complete full course!"
    },
    {
      "date": "2025-11-16",
      "tablet": "Antibiotic - Day 2/7",
      "time": "Every 8 hours",
      "notes": "Complete full course!"
    }
  ]
}
```

## 💡 Pro Tips

1. **One file per person** - Easier to manage and update
2. **Descriptive filenames** - Use names like `person-reminders.json`
3. **E.164 phone format** - Always include `+` and country code
4. **Test with yourself first** - Create your own file and test before adding family
5. **Bulk schedule** - Add a whole month of reminders at once
6. **Use clear notes** - Include timing, food requirements, etc.
7. **Version control** - Git tracks all changes to reminder files

## 🔧 Environment Variables

Only **Twilio credentials** are needed in Vercel (no RECIPIENT needed!):

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=MG...  (or TWILIO_PHONE_NUMBER)
```

Phone numbers come from each JSON file! 📱

## 🛠️ Troubleshooting

### "No reminders for today" but JSON has today's date

- Check date format: `YYYY-MM-DD`
- Validate JSON syntax (use jsonlint.com)
- Make sure file is in `data/` folder
- Check file ends with `.json`

### SMS not sending to some people

- Check phone number format (must start with `+`)
- Verify Twilio trial account has verified this number
- Check Vercel logs for specific errors

### JSON syntax error

Common issues:
- Missing comma between array items
- Trailing comma after last item (remove it)
- Using single quotes instead of double quotes
- Missing closing bracket `}`

**Fix**: Use a JSON validator before pushing

### Testing locally

```bash
# Make sure .env has Twilio credentials
cp .credentials .env

# Run test
npm run test:reminder  # Check only
npm test              # Send actual SMS
```

## 📚 Additional Resources

- See `data/README.md` for detailed folder documentation
- See `test-reminder.js` to understand the checking logic
- See `api/sms-send.js` to understand the sending logic

---

**Your multi-person tablet reminders are now automated! 💊✅👨‍👩‍👧‍👦**
