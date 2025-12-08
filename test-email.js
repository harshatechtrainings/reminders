/**
 * Test Email Sending via Gmail
 * 
 * Run: npm run test:email
 * 
 * Make sure .env has:
 * - GMAIL_USER=yourname@gmail.com
 * - GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 * - NOTIFICATION_EMAIL=recipient@example.com
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
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
 * Calculate age in days from DOB
 */
function calculateAgeInDays(dob) {
  if (!dob) return null;
  
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    birthDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today - birthDate;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return null;
  }
}

/**
 * Format age info
 */
function formatAgeInfo(dob) {
  const days = calculateAgeInDays(dob);
  if (days === null || days < 0) return 'N/A';
  
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  
  return `${days} days (${months} month${months !== 1 ? 's' : ''}, ${remainingDays} days)`;
}

/**
 * Get all reminders for today
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
    console.error('⚠️  Error reading reminders from data folder:', error.message);
    return [];
  }
}

/**
 * Generate HTML email for medications
 */
function generateMedicationEmail(reminders) {
  const today = getTodaysDate();
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #e91e63; border-bottom: 2px solid #e91e63; padding-bottom: 10px;">
        🐷 Farm Medication Reminders
      </h1>
      <p style="color: #666; font-size: 14px;">Date: ${today}</p>
      <p style="background: #4CAF50; color: white; padding: 10px; border-radius: 5px;">
        📋 <strong>${reminders.length} medication(s) scheduled for today</strong>
      </p>
  `;

  reminders.forEach((item, index) => {
    const ageInfo = item.dob ? formatAgeInfo(item.dob) : 'N/A';
    
    html += `
      <div style="background: #f9f9f9; border-left: 4px solid #e91e63; margin: 15px 0; padding: 15px; border-radius: 0 5px 5px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">
          ${index + 1}. ${item.name}
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #666;">📅 Age:</td>
            <td style="padding: 5px 0;"><strong>${ageInfo}</strong></td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">💊 Medication:</td>
            <td style="padding: 5px 0;"><strong>${item.reminder.tablet}</strong></td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">🕐 Time:</td>
            <td style="padding: 5px 0;"><strong>${item.reminder.time}</strong></td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">📝 Notes:</td>
            <td style="padding: 5px 0;"><strong>${item.reminder.notes}</strong></td>
          </tr>
        </table>
      </div>
    `;
  });

  html += `
      <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
        <p style="margin: 0; color: #1976D2;">
          ✅ Complete all medications and mark as done!
        </p>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
        Sent automatically by Pig Farm Reminder System
      </p>
    </div>
  `;

  return html;
}

/**
 * Generate HTML email for no medications
 */
function generateNoMedicationEmail(pigCount) {
  const today = getTodaysDate();
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
        🐷 Farm Update - All Clear!
      </h1>
      <p style="color: #666; font-size: 14px;">Date: ${today}</p>
      
      <div style="background: #e8f5e9; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
        <h2 style="color: #4CAF50; margin: 0;">
          ✅ No medications scheduled today!
        </h2>
      </div>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px 0;">📊 Total Pigs:</td>
            <td style="padding: 5px 0; text-align: right;"><strong>${pigCount}</strong></td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">💊 Medications Today:</td>
            <td style="padding: 5px 0; text-align: right;"><strong>0</strong></td>
          </tr>
        </table>
      </div>
      
      <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 0; color: #e65100;">
          🎉 Enjoy your day! Check back tomorrow for updates.
        </p>
      </div>
      
      <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
        Sent automatically by Pig Farm Reminder System
      </p>
    </div>
  `;
}

async function testGmailEmail() {
  console.log('\n📧 Testing Gmail Email Sending...\n');

  // Read environment variables
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
  const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;
  const todaysDate = getTodaysDate();

  // Validate environment variables
  const missing = [];
  if (!GMAIL_USER) missing.push('GMAIL_USER');
  if (!GMAIL_APP_PASSWORD) missing.push('GMAIL_APP_PASSWORD');
  if (!NOTIFICATION_EMAIL) missing.push('NOTIFICATION_EMAIL');

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('\nPlease add them to your .env file:');
    console.error('   GMAIL_USER=yourname@gmail.com');
    console.error('   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx');
    console.error('   NOTIFICATION_EMAIL=recipient@example.com\n');
    console.error('📖 See GMAIL_SETUP.md for how to get App Password\n');
    process.exit(1);
  }

  console.log('📋 Email Configuration:');
  console.log('   Date:', todaysDate);
  console.log('   From:', GMAIL_USER);
  console.log('   To:', NOTIFICATION_EMAIL);
  console.log('');

  // Get today's reminders
  const allTodaysReminders = getAllTodaysReminders();

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD
    }
  });

  // Verify connection
  console.log('🔌 Verifying Gmail connection...');
  
  try {
    await transporter.verify();
    console.log('   ✅ Connection successful!\n');
  } catch (error) {
    console.error('   ❌ Connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if GMAIL_USER is correct');
    console.error('   2. Check if GMAIL_APP_PASSWORD is correct (use App Password, not regular password)');
    console.error('   3. Make sure 2-Step Verification is enabled in Gmail');
    console.error('   4. Generate App Password at: https://myaccount.google.com/apppasswords\n');
    process.exit(1);
  }

  // Prepare email
  let mailOptions;
  
  if (allTodaysReminders.length === 0) {
    console.log('ℹ️  No medications scheduled for today');
    console.log('   Sending "No medications" email...\n');
    
    const dataPath = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
    const pigCount = files.length;
    
    mailOptions = {
      from: `"🐷 Pig Farm Reminders" <${GMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject: `✅ Farm Update - No Medications Today (${todaysDate})`,
      html: generateNoMedicationEmail(pigCount)
    };
    
    console.log('📨 Email Preview:');
    console.log('─────────────────────────────────');
    console.log(`Subject: ${mailOptions.subject}`);
    console.log('Content: No medications for today!');
    console.log(`Total Pigs: ${pigCount}`);
    console.log('─────────────────────────────────\n');
    
  } else {
    console.log(`✅ Found ${allTodaysReminders.length} reminder(s) for today:\n`);
    
    allTodaysReminders.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name}`);
      if (item.dob) {
        console.log(`      📅 Age: ${formatAgeInfo(item.dob)}`);
      }
      console.log(`      💊 ${item.reminder.tablet}`);
      console.log(`      🕐 ${item.reminder.time}`);
      console.log(`      📝 ${item.reminder.notes}\n`);
    });
    
    mailOptions = {
      from: `"🐷 Pig Farm Reminders" <${GMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject: `💊 ${allTodaysReminders.length} Medication(s) Today (${todaysDate})`,
      html: generateMedicationEmail(allTodaysReminders)
    };
    
    console.log('📨 Email Preview:');
    console.log('─────────────────────────────────');
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Reminders: ${allTodaysReminders.length}`);
    console.log('─────────────────────────────────\n');
  }

  // Send email
  console.log('📤 Sending email...\n');
  
  try {
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ SUCCESS! Email sent!\n');
    console.log('📊 Response Details:');
    console.log('   Message ID:', info.messageId);
    console.log('   Accepted:', info.accepted.join(', '));
    console.log('   Response:', info.response);
    console.log('\n📬 Check inbox at:', NOTIFICATION_EMAIL);
    console.log('\n💰 Cost: FREE! (vs ~$0.05 per SMS)\n');
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your App Password is correct');
    console.error('   2. Make sure recipient email is valid');
    console.error('   3. Check if Gmail has any security alerts\n');
    process.exit(1);
  }
}

// Run the test
testGmailEmail();

