/**
 * Test script to check today's reminder
 * Run with: node test-reminder.js
 */

const fs = require('fs');
const path = require('path');

function getTodaysDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodaysReminder() {
  try {
    const remindersPath = path.join(__dirname, 'reminders.json');
    const remindersData = fs.readFileSync(remindersPath, 'utf8');
    const reminders = JSON.parse(remindersData);
    
    const todaysDate = getTodaysDate();
    const todaysReminder = reminders.reminders.find(r => r.date === todaysDate);
    
    return { todaysDate, todaysReminder, allReminders: reminders.reminders };
  } catch (error) {
    console.error('Error reading reminders.json:', error.message);
    return null;
  }
}

console.log('\n📅 Tablet Reminder Checker\n');

const result = getTodaysReminder();

if (!result) {
  console.log('❌ Could not read reminders.json');
  console.log('   Make sure the file exists in the project root.\n');
  process.exit(1);
}

console.log(`📆 Today's Date: ${result.todaysDate}\n`);

if (result.todaysReminder) {
  console.log('✅ Reminder Found for Today!\n');
  console.log('💊 Tablet:', result.todaysReminder.tablet);
  console.log('🕐 Time:', result.todaysReminder.time);
  console.log('📝 Notes:', result.todaysReminder.notes);
  console.log('\n📱 SMS will be sent:');
  console.log('─────────────────────────────────');
  console.log(`📋 Daily Reminder!\n\n💊 Tablet: ${result.todaysReminder.tablet}\n🕐 Time: ${result.todaysReminder.time}\n📝 Notes: ${result.todaysReminder.notes}`);
  console.log('─────────────────────────────────\n');
} else {
  console.log('ℹ️  No reminder scheduled for today\n');
  console.log('📋 Upcoming reminders:');
  
  const futureReminders = result.allReminders
    .filter(r => r.date >= result.todaysDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  
  if (futureReminders.length > 0) {
    futureReminders.forEach(r => {
      console.log(`   ${r.date} - ${r.tablet}`);
    });
  } else {
    console.log('   No upcoming reminders found');
  }
  
  console.log('\n💡 Add a reminder for today:');
  console.log(`   Edit reminders.json and add a reminder with date: "${result.todaysDate}"\n`);
}

