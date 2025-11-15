# 📁 Reminders Data Folder

This folder contains JSON files for tablet reminders. Each JSON file represents reminders for one person or category.

## 📋 JSON File Structure

Each file should follow this format:

```json
{
  "name": "Person Name",
  "phone": "+919876543210",
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "Vitamin D - 1000 IU",
      "time": "morning",
      "notes": "Take after breakfast"
    }
  ]
}
```

## 🎯 Fields Explanation

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| `name` | ✅ Yes | String | `"Harsha"`, `"Mom"` |
| `phone` | ✅ Yes | E.164 format with + | `"+918886968635"` |
| `reminders` | ✅ Yes | Array of objects | See below |

### Reminder Object:

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| `date` | ✅ Yes | YYYY-MM-DD | `"2025-11-15"` |
| `tablet` | ✅ Yes | String | `"Vitamin D - 1000 IU"` |
| `time` | ✅ Yes | String | `"morning"`, `"evening"` |
| `notes` | ✅ Yes | String | `"Take after breakfast"` |

## 📱 SMS Format

When a reminder matches today's date, an SMS is sent:

```
📋 Hello {name}!

💊 Tablet: {tablet}
🕐 Time: {time}
📝 Notes: {notes}
```

## 📂 Example Files

- **harsha-reminders.json** - Reminders for Harsha
- **family-reminders.json** - Reminders for family members

## ➕ Adding New Person

Create a new JSON file:

```bash
# Example: dad-reminders.json
{
  "name": "Dad",
  "phone": "+919123456789",
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "Blood Pressure Medicine",
      "time": "morning",
      "notes": "Take with breakfast"
    }
  ]
}
```

## ✅ Best Practices

1. **One file per person** - Easier to manage
2. **Descriptive filenames** - Use names like `harsha-reminders.json`
3. **E.164 phone format** - Always include `+` and country code
4. **YYYY-MM-DD dates** - Sortable and clear
5. **Clear notes** - Include timing and food instructions

## 🧪 Testing

Check if reminders are set up correctly:

```bash
# Check today's reminders (no SMS sent)
npm run test:reminder

# Send test SMS (actual SMS sent)
npm test
```

## 🎯 How It Works

1. **Daily Cron** triggers at 8:00 AM IST
2. **System reads** all `.json` files from this folder
3. **Checks date** in each file's reminders array
4. **Sends SMS** to each person with a matching reminder
5. **Multiple people** can have reminders on the same day!

## 📊 Example: Same Day, Multiple People

If both `harsha-reminders.json` and `family-reminders.json` have reminders for `2025-11-15`, BOTH will receive SMS at 8:00 AM!

---

**Happy reminder scheduling! 💊✅**

