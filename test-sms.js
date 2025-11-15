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
 * Check if there's a reminder for today
 */
function getTodaysReminder() {
  try {
    const remindersPath = path.join(__dirname, 'reminders.json');
    const remindersData = fs.readFileSync(remindersPath, 'utf8');
    const reminders = JSON.parse(remindersData);
    
    const todaysDate = getTodaysDate();
    const todaysReminder = reminders.reminders.find(r => r.date === todaysDate);
    
    return todaysReminder;
  } catch (error) {
    console.error('⚠️  Warning: Could not read reminders.json:', error.message);
    return null;
  }
}

async function testTwilioSMS() {
  console.log('\n📱 Testing Twilio SMS API with Reminder System...\n');

  // Read environment variables
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
  const RECIPIENT = process.env.RECIPIENT;
  
  // Check if there's a reminder for today
  const todaysReminder = getTodaysReminder();
  const todaysDate = getTodaysDate();
  
  let MESSAGE_TEXT;
  if (todaysReminder) {
    // Build message from reminder data
    MESSAGE_TEXT = `📋 Daily Reminder!\n\n💊 Tablet: ${todaysReminder.tablet}\n🕐 Time: ${todaysReminder.time}\n📝 Notes: ${todaysReminder.notes}`;
    console.log(`✅ Found reminder for today (${todaysDate}):`);
    console.log(`   💊 ${todaysReminder.tablet}`);
    console.log(`   🕐 ${todaysReminder.time}`);
    console.log(`   📝 ${todaysReminder.notes}\n`);
  } else {
    // No reminder for today
    const sendDefaultMessage = process.env.SEND_DEFAULT_MESSAGE !== 'false';
    
    if (!sendDefaultMessage) {
      console.log(`ℹ️  No reminder scheduled for today (${todaysDate})`);
      console.log('   SEND_DEFAULT_MESSAGE is set to false, so no SMS will be sent.\n');
      console.log('💡 To add a reminder for today, edit reminders.json\n');
      return;
    }
    
    MESSAGE_TEXT = process.env.MESSAGE_TEXT || 'Daily update ✅ - No specific reminder for today!';
    console.log(`ℹ️  No reminder found for today (${todaysDate})`);
    console.log('   Using default message instead.\n');
  }

  // Validate environment variables
  const missing = [];
  if (!TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
  if (!TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
  if (!RECIPIENT) missing.push('RECIPIENT');

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('\nPlease add them to your .env file');
    console.error('See .env.twilio for examples\n');
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
  console.log('   To:', RECIPIENT);
  console.log('   Account SID:', TWILIO_ACCOUNT_SID.substring(0, 10) + '...');
  console.log('\n📨 Message to send:');
  console.log('─────────────────────────────────');
  console.log(MESSAGE_TEXT);
  console.log('─────────────────────────────────\n');

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

  console.log('📤 Sending SMS...\n');

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
      console.log('✅ SUCCESS! SMS sent successfully!\n');
      console.log('📊 Response Details:');
      console.log('   Message SID:', data.sid);
      console.log('   Status:', data.status);
      console.log('   To:', data.to);
      console.log('   From:', data.from);
      console.log('   Date Created:', data.date_created);
      if (todaysReminder) {
        console.log('\n💊 Reminder Sent:');
        console.log('   Tablet:', todaysReminder.tablet);
        console.log('   Time:', todaysReminder.time);
      }
      console.log('\n📱 Check your phone (+' + data.to.replace('+', '') + ') for the SMS!\n');
    } else {
      console.error('❌ ERROR! Failed to send SMS\n');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
      
      // Common error explanations
      if (data.code) {
        console.error('\n💡 Troubleshooting:');
        
        if (data.code === 21608) {
          console.error('   → Trial account restriction');
          console.error('   → Verify the recipient number in Twilio console');
          console.error('   → Or upgrade your Twilio account');
        } else if (data.code === 21211) {
          console.error('   → Invalid "To" phone number');
          console.error('   → Make sure it\'s in E.164 format (e.g., +919876543210)');
        } else if (data.code === 21606) {
          console.error('   → Invalid "From" phone number');
          console.error('   → Use a valid Twilio number from your account');
        } else if (data.code === 20003) {
          console.error('   → Authentication error');
          console.error('   → Check your Account SID and Auth Token');
        } else if (data.code === 21614) {
          console.error('   → Invalid phone number format');
          console.error('   → Both numbers must include country code with +');
        }
      }
      console.error('\n');
    }
  } catch (error) {
    console.error('❌ NETWORK ERROR!\n');
    console.error('Message:', error.message);
    console.error('\nMake sure you have internet connection.\n');
  }
}

// Run the test
testTwilioSMS();

