# 📁 Reminders Data Folder

This folder contains JSON files for tablet reminders. Each JSON file represents reminders for one person or category.

## 📋 JSON File Structure

Each file should follow this format:

```json
{
  "name": "Person Name",
  "phone": "+919876543210",
  "dob": "2025-08-01",
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
| `name` | ✅ Yes | String | `"Harsha"`, `"Pig 94"` |
| `phone` | ✅ Yes | E.164 format with + | `"+918886968635"` |
| `dob` | ⚠️ Optional | YYYY-MM-DD | `"2025-08-01"` |
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

**With DOB:**
```
📋 Hello {name}!
📅 Age: {days} days ({months} months, {days} days)

💊 Tablet: {tablet}
🕐 Time: {time}
📝 Notes: {notes}
```

**Without DOB:**
```
📋 Hello {name}!

💊 Tablet: {tablet}
🕐 Time: {time}
📝 Notes: {notes}
```

## 📂 Example Files

- **harsha-reminders.json** - Reminders for Pig 1
- **family-reminders.json** - Reminders for Pig 2
- **94-reminders.json** - Reminders for Pig 94 (7 children)
- **95-reminders.json** - Reminders for Pig 95

## 🐷 Use Case: Pig Farm Management

This system is perfect for tracking pig medication schedules:
- **DOB tracking** - Know exactly how old each pig is
- **Medication reminders** - Get SMS for daily injections, dewormers, vitamins
- **Multiple pigs** - Manage entire farm in one place
- **Age in message** - Each SMS shows pig's current age in days

## ➕ Adding New Pig/Person

Create a new JSON file:

```bash
# Example: pig-96-reminders.json
{
  "name": "Pig 96",
  "phone": "+919123456789",
  "dob": "2025-08-15",
  "reminders": [
    {
      "date": "2025-11-15",
      "tablet": "IRON",
      "time": "morning",
      "notes": "IM, 1 ml, Brand: -"
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

