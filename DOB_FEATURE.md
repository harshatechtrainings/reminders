# 🎂 DOB (Date of Birth) Feature

## ✨ Overview

The reminder system now supports **DOB tracking** to automatically calculate and display age in days!

## 🎯 Use Case

Perfect for **pig farm management**:
- Track pig age automatically
- Know exact age during medication schedules
- Monitor growth milestones
- Calculate age in days and months

## 📋 How It Works

1. Add `dob` field to any JSON file in `data/` folder
2. System calculates age from DOB to current date
3. Age is included in SMS messages automatically
4. Shows age in **days** and **months**

## 📝 JSON Format

Add the `dob` field (YYYY-MM-DD format):

```json
{
  "name": "Pig 94 :7 Childs - Reminder Schedule",
  "phone": "+919490979948",
  "dob": "2025-08-13",
  "reminders": [
    {
      "date": "2025-11-27",
      "tablet": "LIV-52",
      "time": "morning",
      "notes": "ORAL, 5 ml, Brand: -"
    }
  ]
}
```

## 📱 SMS Output

**With DOB:**
```
📋 Hello Pig 94 :7 Childs - Reminder Schedule!
📅 Age: 106 days (3 months, 16 days)

💊 Tablet: LIV-52
🕐 Time: morning
📝 Notes: ORAL, 5 ml, Brand: -
```

**Without DOB (optional field):**
```
📋 Hello Pig 94 :7 Childs - Reminder Schedule!

💊 Tablet: LIV-52
🕐 Time: morning
📝 Notes: ORAL, 5 ml, Brand: -
```

## 🧮 Age Calculation

- **Total days** from birth to current date
- **Months** calculated as `days / 30`
- **Remaining days** shown after months

### Example:
- DOB: `2025-08-13`
- Current Date: `2025-11-27`
- **Result:** `106 days (3 months, 16 days)`

## 🧪 Testing

### Check Today's Reminders with DOB Info

```bash
npm run test:reminder
```

**Output:**
```
✅ Found 1 Reminder(s) for Today!

═══════════════════════════════════
📄 File: 94-reminders.json
👤 Name: Pig 94 :7 Childs - Reminder Schedule
📞 Phone: +919490979948
🎂 DOB: 2025-08-13 → Age: 106 days (3 months, 16 days)
💊 Tablet: LIV-52
🕐 Time: morning
📝 Notes: ORAL, 5 ml, Brand: -
```

### Send Test SMS

```bash
npm test
```

This will send actual SMS with age included!

## 📊 Example Files with DOB

All pig files now have DOB:

```bash
data/
├── 94-reminders.json       # DOB: 2025-08-13
├── 95-reminders.json       # DOB: 2025-08-14
├── narasimha-reminders.json # DOB: 2025-08-10
├── pandu-reminders.json    # DOB: 2025-08-12
├── harsha-test-reminders.json # DOB: 2025-08-05
├── harsha-reminders.json   # DOB: 2025-08-01
└── family-reminders.json   # DOB: 2025-07-15
```

## ✅ Benefits for Pig Farm

1. **Automatic age tracking** - No manual calculation needed
2. **Growth monitoring** - Know exact age during treatments
3. **Medication timing** - Age-appropriate dosing
4. **Record keeping** - Birth dates stored with reminders
5. **Multi-pig management** - Track entire farm's ages

## 🔧 Implementation Details

### Files Modified:
- `api/sms-send.js` - Added `calculateAgeInDays()` and `formatAgeInfo()`
- `test-sms.js` - Added age display in console and SMS
- `test-reminder.js` - Added age display in output
- `data/*.json` - Added `dob` field to all files
- `data/README.md` - Updated documentation

### Functions Added:

```javascript
// Calculate age in days
function calculateAgeInDays(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  const diffDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Format age for message
function formatAgeInfo(dob) {
  const days = calculateAgeInDays(dob);
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  return `\n📅 Age: ${days} days (${months} months, ${remainingDays} days)`;
}
```

## 🎨 Customization

### Change Age Format

Edit the `formatAgeInfo()` function in:
- `api/sms-send.js`
- `test-sms.js`
- `test-reminder.js`

### Examples:

**Weeks and Days:**
```javascript
const weeks = Math.floor(days / 7);
const remainingDays = days % 7;
return `\n📅 Age: ${weeks} weeks, ${remainingDays} days`;
```

**Days Only:**
```javascript
return `\n📅 Age: ${days} days old`;
```

**Months Only (rounded):**
```javascript
const months = Math.round(days / 30);
return `\n📅 Age: ~${months} months`;
```

## ⚠️ Notes

1. **DOB is optional** - Files without DOB still work fine
2. **Format must be YYYY-MM-DD** - e.g., `2025-08-13`
3. **Month calculation** uses 30 days (approximate)
4. **Age shows in local time** - Based on server date

## 🚀 Deployment

After adding DOB to files:

```bash
git add data/
git commit -m "Add DOB tracking for pig age calculation"
git push
```

Vercel will auto-deploy with the new feature!

## 📚 Related Documentation

- See `data/README.md` for complete JSON structure
- See `REMINDERS_GUIDE.md` for general usage
- See `MULTI_PERSON_UPDATE.md` for multi-person system

---

**DOB Feature Complete! 🎂 Now tracking pig ages automatically! 🐷✅**

Date: 2025-11-27
Feature: DOB with Age Calculation



