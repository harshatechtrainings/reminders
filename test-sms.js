/**
 * Local testing script for Twilio SMS API with Reminder System
 * Run this with: node test-sms.js
 * 
 * Make sure you have:
 * 1. Created .env file with your Twilio credentials
 * 2. Created reminders.json with your tablet reminders
 * 3. Installed dependencies: npm install
 */

// Load environment variables from .env file
require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodaysDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate age in days from DOB to current date
 */
function calculateAgeInDays(dob) {
  if (!dob) return null;
  
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    
    // Set time to midnight to get accurate day count
    birthDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - birthDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
}

/**
 * Format age info for message
 */
function formatAgeInfo(dob) {
  const days = calculateAgeInDays(dob);
  if (days === null || days < 0) return '';
  
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  
  if (months > 0) {
    return `\n📅 Age: ${days} days (${months} month${months > 1 ? 's' : ''}, ${remainingDays} days)`;
  } else {
    return `\n📅 Age: ${days} days`;
  }
}

/**
 * Get all reminders for today from all JSON files in data/ folder
 * Returns array of { name, phone, reminder } objects
 */
function getAllTodaysReminders() {
  try {
    const dataPath = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
    
    const todaysDate = getTodaysDate();
    const allReminders = [];
    
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
      } catch (fileError) {
        console.error(`⚠️  Error reading ${file}:`, fileError.message);
      }
    }
    
    return allReminders;
  } catch (error) {
    console.error('⚠️  Warning: Could not read reminders from data folder:', error.message);
    return [];
  }
}

async function testTwilioSMS() {
  console.log('\n📱 Testing Twilio SMS API with Multi-Person Reminder System...\n');

  // Read environment variables
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
  
  // Get all reminders for today from all JSON files
  const allTodaysReminders = getAllTodaysReminders();
  const todaysDate = getTodaysDate();
  
  if (allTodaysReminders.length === 0) {
    console.log(`ℹ️  No reminders scheduled for today (${todaysDate})`);
    console.log('   Will send "No medications today" message to all contacts.\n');
    
    const sendNoMedicationMessage = process.env.SEND_NO_MEDICATION_MESSAGE !== 'false';
    
    if (!sendNoMedicationMessage) {
      console.log('❌ SEND_NO_MEDICATION_MESSAGE is set to false, skipping SMS.\n');
      return;
    }
    
    // Get all contacts from data/ folder
    try {
      const dataPath = path.join(__dirname, 'data');
      const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
      
      console.log(`📋 Found ${files.length} contact(s) to notify:\n`);
      
      const allContacts = [];
      for (const file of files) {
        try {
          const filePath = path.join(dataPath, file);
          const fileData = fs.readFileSync(filePath, 'utf8');
          const reminderFile = JSON.parse(fileData);
          
          if (reminderFile.phone) {
            allContacts.push({
              name: reminderFile.name,
              phone: reminderFile.phone,
              dob: reminderFile.dob,
              source: file
            });
            
            console.log(`   📄 ${file}`);
            console.log(`   👤 ${reminderFile.name} (${reminderFile.phone})`);
            if (reminderFile.dob) {
              const ageDays = calculateAgeInDays(reminderFile.dob);
              const months = Math.floor(ageDays / 30);
              const days = ageDays % 30;
              console.log(`   🎂 DOB: ${reminderFile.dob} (${ageDays} days old = ${months}m ${days}d)`);
            }
            console.log('');
          }
        } catch (fileError) {
          console.error(`⚠️  Error reading ${file}:`, fileError.message);
        }
      }
      
      if (allContacts.length === 0) {
        console.log('❌ No valid contacts found in data/ folder\n');
        return;
      }
      
      // Continue with sending SMS to all contacts
      console.log('📋 SMS Configuration:');
      console.log('   Date:', todaysDate);
      if (TWILIO_MESSAGING_SERVICE_SID) {
        console.log('   Messaging Service SID:', TWILIO_MESSAGING_SERVICE_SID);
      } else {
        console.log('   From:', TWILIO_PHONE_NUMBER);
      }
      console.log('   Account SID:', TWILIO_ACCOUNT_SID.substring(0, 10) + '...\n');

      console.log(`📤 Sending "No medications" SMS to ${allContacts.length} contact(s)...\n`);

      const results = [];

      for (const { name, phone, dob, source } of allContacts) {
        const ageInfo = formatAgeInfo(dob);
        const MESSAGE_TEXT = `📋 Hello ${name}!${ageInfo}\n\n✅ Good news! No medications scheduled for today.\n\n🎉 Enjoy your day!`;
        const RECIPIENT = phone;

        console.log(`➤ Sending to ${name} (${phone})...`);

        const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        const authHeader = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const formData = new URLSearchParams();
        
        if (TWILIO_MESSAGING_SERVICE_SID) {
          formData.append('MessagingServiceSid', TWILIO_MESSAGING_SERVICE_SID);
        } else {
          formData.append('From', TWILIO_PHONE_NUMBER);
        }
        
        formData.append('To', RECIPIENT);
        formData.append('Body', MESSAGE_TEXT);

        try {
          const response = await fetch(twilioApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
          });

          const data = await response.json();

          if (response.ok) {
            console.log(`   ✅ SUCCESS! Message ID: ${data.sid}\n`);
            results.push({
              name,
              phone,
              success: true,
              messageId: data.sid,
              status: data.status
            });
          } else {
            console.error(`   ❌ FAILED! Status: ${response.status}`);
            console.error(`   Error: ${JSON.stringify(data, null, 2)}\n`);
            results.push({
              name,
              phone,
              success: false,
              error: data.message || 'Failed to send SMS'
            });
          }
        } catch (smsError) {
          console.error(`   ❌ ERROR: ${smsError.message}\n`);
          results.push({
            name,
            phone,
            success: false,
            error: smsError.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      console.log('═══════════════════════════════════');
      console.log('📊 SUMMARY - NO MEDICATIONS TODAY');
      console.log('═══════════════════════════════════');
      console.log(`Total contacts: ${results.length}`);
      console.log(`✅ Sent successfully: ${successCount}`);
      console.log(`❌ Failed: ${failCount}`);
      console.log('═══════════════════════════════════\n');

      if (successCount > 0) {
        console.log('📱 Check phones for "No medications today" SMS!\n');
      }
      
      return;
    } catch (error) {
      console.error('❌ Error processing contacts:', error.message);
      return;
    }
  }

  console.log(`✅ Found ${allTodaysReminders.length} reminder(s) for today (${todaysDate}):\n`);
  
  for (const { name, phone, dob, reminder, source } of allTodaysReminders) {
    console.log(`   📄 ${source}`);
    console.log(`   👤 ${name} (${phone})`);
    if (dob) {
      const ageDays = calculateAgeInDays(dob);
      const months = Math.floor(ageDays / 30);
      const days = ageDays % 30;
      console.log(`   🎂 DOB: ${dob} (${ageDays} days old = ${months}m ${days}d)`);
    }
    console.log(`   💊 ${reminder.tablet}`);
    console.log(`   🕐 ${reminder.time}`);
    console.log(`   📝 ${reminder.notes}\n`);
  }

  // Validate environment variables
  const missing = [];
  if (!TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
  if (!TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('\nPlease add them to your .env file\n');
    process.exit(1);
  }

  if (!TWILIO_MESSAGING_SERVICE_SID && !TWILIO_PHONE_NUMBER) {
    console.error('❌ You must provide either:');
    console.error('   - TWILIO_MESSAGING_SERVICE_SID (recommended)');
    console.error('   - TWILIO_PHONE_NUMBER\n');
    process.exit(1);
  }

  console.log('📋 SMS Configuration:');
  console.log('   Date:', todaysDate);
  if (TWILIO_MESSAGING_SERVICE_SID) {
    console.log('   Messaging Service SID:', TWILIO_MESSAGING_SERVICE_SID);
  } else {
    console.log('   From:', TWILIO_PHONE_NUMBER);
  }
  console.log('   Account SID:', TWILIO_ACCOUNT_SID.substring(0, 10) + '...\n');

  console.log(`📤 Sending ${allTodaysReminders.length} SMS...\n`);

  const results = [];

  // Send SMS to each person with a reminder
  for (const { name, phone, dob, reminder, source } of allTodaysReminders) {
    const ageInfo = formatAgeInfo(dob);
    const MESSAGE_TEXT = `📋 Hello ${name}!${ageInfo}\n\n💊 Tablet: ${reminder.tablet}\n🕐 Time: ${reminder.time}\n📝 Notes: ${reminder.notes}`;
    const RECIPIENT = phone;

    console.log(`➤ Sending to ${name} (${phone})...`);

    // Twilio API endpoint
    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Create Basic Auth header
    const authHeader = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    // Prepare the SMS payload
    const formData = new URLSearchParams();
    
    // Use MessagingServiceSid if provided, otherwise use From phone number
    if (TWILIO_MESSAGING_SERVICE_SID) {
      formData.append('MessagingServiceSid', TWILIO_MESSAGING_SERVICE_SID);
    } else {
      formData.append('From', TWILIO_PHONE_NUMBER);
    }
    
    formData.append('To', RECIPIENT);
    formData.append('Body', MESSAGE_TEXT);

    try {
      const response = await fetch(twilioApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ SUCCESS! Message ID: ${data.sid}\n`);
        results.push({
          name,
          phone,
          success: true,
          messageId: data.sid,
          status: data.status
        });
      } else {
        console.error(`   ❌ FAILED! Status: ${response.status}`);
        console.error(`   Error: ${JSON.stringify(data, null, 2)}\n`);
        results.push({
          name,
          phone,
          success: false,
          error: data.message || 'Failed to send SMS'
        });
      }
    } catch (smsError) {
      console.error(`   ❌ ERROR: ${smsError.message}\n`);
      results.push({
        name,
        phone,
        success: false,
        error: smsError.message
      });
    }
  }

  // Print summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;

  console.log('═══════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════');
  console.log(`Total reminders: ${results.length}`);
  console.log(`✅ Sent successfully: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('═══════════════════════════════════\n');

  if (successCount > 0) {
    console.log('📱 Check phones for SMS!\n');
  }
}

// Run the test
testTwilioSMS();

