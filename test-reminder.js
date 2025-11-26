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

function calculateAgeInDays(dob) {
  if (!dob) return null;
  
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    
    birthDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - birthDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    return null;
  }
}

function getAllTodaysReminders() {
  try {
    const dataPath = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
    
    const todaysDate = getTodaysDate();
    const allReminders = [];
    const allUpcomingReminders = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(dataPath, file);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const reminderFile = JSON.parse(fileData);
        
        // Find reminder for today in this file
        const todaysReminder = reminderFile.reminders?.find(r => r.date === todaysDate);
        
        if (todaysReminder) {
          allReminders.push({
            name: reminderFile.name,
            phone: reminderFile.phone,
            dob: reminderFile.dob,
            reminder: todaysReminder,
            source: file
          });
        }
        
        // Collect upcoming reminders
        reminderFile.reminders?.forEach(r => {
          if (r.date >= todaysDate) {
            allUpcomingReminders.push({
              ...r,
              name: reminderFile.name,
              source: file
            });
          }
        });
      } catch (fileError) {
        console.error(`Error reading ${file}:`, fileError.message);
      }
    }
    
    return { todaysDate, allReminders, allUpcomingReminders };
  } catch (error) {
    console.error('Error reading reminders from data folder:', error.message);
    return null;
  }
}

console.log('\n📅 Multi-Person Tablet Reminder Checker\n');

const result = getAllTodaysReminders();

if (!result) {
  console.log('❌ Could not read reminders from data/ folder');
  console.log('   Make sure the data/ folder exists with JSON files.\n');
  process.exit(1);
}

console.log(`📆 Today's Date: ${result.todaysDate}\n`);

if (result.allReminders.length > 0) {
  console.log(`✅ Found ${result.allReminders.length} Reminder(s) for Today!\n`);
  
  result.allReminders.forEach(({ name, phone, dob, reminder, source }) => {
    console.log('═══════════════════════════════════');
    console.log(`📄 File: ${source}`);
    console.log(`👤 Name: ${name}`);
    console.log(`📞 Phone: ${phone}`);
    
    if (dob) {
      const ageDays = calculateAgeInDays(dob);
      const months = Math.floor(ageDays / 30);
      const days = ageDays % 30;
      console.log(`🎂 DOB: ${dob} → Age: ${ageDays} days (${months} months, ${days} days)`);
    }
    
    console.log(`💊 Tablet: ${reminder.tablet}`);
    console.log(`🕐 Time: ${reminder.time}`);
    console.log(`📝 Notes: ${reminder.notes}`);
    console.log('\n📱 SMS will be sent:');
    console.log('─────────────────────────────────');
    
    const ageInfo = dob ? `\n📅 Age: ${calculateAgeInDays(dob)} days (${Math.floor(calculateAgeInDays(dob) / 30)} months, ${calculateAgeInDays(dob) % 30} days)` : '';
    console.log(`📋 Hello ${name}!${ageInfo}\n\n💊 Tablet: ${reminder.tablet}\n🕐 Time: ${reminder.time}\n📝 Notes: ${reminder.notes}`);
    console.log('─────────────────────────────────\n');
  });
} else {
  console.log('ℹ️  No reminders scheduled for today\n');
  console.log('📨 "No medications today" message will be sent to ALL contacts:\n');
  
  // Show all contacts who will receive the message
  try {
    const dataPath = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
    
    console.log('═══════════════════════════════════');
    console.log('📋 CONTACTS WHO WILL RECEIVE SMS');
    console.log('═══════════════════════════════════\n');
    
    let contactCount = 0;
    for (const file of files) {
      try {
        const filePath = path.join(dataPath, file);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const reminderFile = JSON.parse(fileData);
        
        if (reminderFile.phone) {
          contactCount++;
          console.log(`${contactCount}. ${reminderFile.name} (${reminderFile.phone})`);
          if (reminderFile.dob) {
            const ageDays = calculateAgeInDays(reminderFile.dob);
            const months = Math.floor(ageDays / 30);
            const days = ageDays % 30;
            console.log(`   📅 Age: ${ageDays} days (${months} months, ${days} days)`);
          }
          console.log('   📱 SMS:');
          const ageInfo = reminderFile.dob ? `\n📅 Age: ${calculateAgeInDays(reminderFile.dob)} days (${Math.floor(calculateAgeInDays(reminderFile.dob) / 30)} months, ${calculateAgeInDays(reminderFile.dob) % 30} days)` : '';
          console.log(`   ─────────────────────────────────`);
          console.log(`   📋 Hello ${reminderFile.name}!${ageInfo}\n\n   ✅ Good news! No medications scheduled for today.\n\n   🎉 Enjoy your day!`);
          console.log(`   ─────────────────────────────────\n`);
        }
      } catch (fileError) {
        console.error(`⚠️  Error reading ${file}:`, fileError.message);
      }
    }
    
    console.log('═══════════════════════════════════');
    console.log(`Total contacts: ${contactCount}`);
    console.log('═══════════════════════════════════\n');
    
  } catch (error) {
    console.error('Error reading contacts:', error.message);
  }
  
  console.log('📋 Upcoming reminders from all files:');
  
  const futureReminders = result.allUpcomingReminders
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);
  
  if (futureReminders.length > 0) {
    futureReminders.forEach(r => {
      console.log(`   ${r.date} - ${r.name}: ${r.tablet}`);
    });
  } else {
    console.log('   No upcoming reminders found');
  }
  
  console.log('\n💡 Add a reminder for today:');
  console.log(`   Edit JSON files in data/ folder and add a reminder with date: "${result.todaysDate}"\n`);
}

