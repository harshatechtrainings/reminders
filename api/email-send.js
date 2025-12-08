/**
 * Email Reminder API - Sends daily pig medication reminders via Gmail
 * 
 * Uses Nodemailer with Gmail - COMPLETELY FREE!
 * 
 * Environment Variables Required:
 * - GMAIL_USER: Your Gmail address (e.g., yourname@gmail.com)
 * - GMAIL_APP_PASSWORD: Gmail App Password (NOT your regular password)
 * - NOTIFICATION_EMAIL: Email address to receive reminders
 * 
 * Features:
 * - Reads all JSON files from data/ folder
 * - Checks if today's date has reminders
 * - Sends email with medication details + age
 * - Sends consolidated "no medications" email when none scheduled
 */

import nodemailer from 'nodemailer';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

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
  if (days === null || days < 0) return '';
  
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  
  return `${days} days (${months} month${months !== 1 ? 's' : ''}, ${remainingDays} days)`;
}

/**
 * Get all reminders for today from all JSON files
 */
function getAllTodaysReminders() {
  try {
    const dataPath = join(process.cwd(), 'data');
    const files = readdirSync(dataPath).filter(f => f.endsWith('.json'));
    
    const todaysDate = getTodaysDate();
    const allReminders = [];
    
    for (const file of files) {
      try {
        const filePath = join(dataPath, file);
        const fileData = readFileSync(filePath, 'utf8');
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
        console.error(`Error reading ${file}:`, fileError.message);
      }
    }
    
    return allReminders;
  } catch (error) {
    console.error('Error reading reminders from data folder:', error);
    return [];
  }
}

/**
 * Create Gmail transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow GET for cron and POST for manual testing
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['GET', 'POST'] 
    });
  }

  try {
    // Read environment variables
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;

    // Validate required environment variables
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !NOTIFICATION_EMAIL) {
      return res.status(500).json({
        error: 'Missing required environment variables',
        required: ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'NOTIFICATION_EMAIL'],
        missing: {
          GMAIL_USER: !GMAIL_USER,
          GMAIL_APP_PASSWORD: !GMAIL_APP_PASSWORD,
          NOTIFICATION_EMAIL: !NOTIFICATION_EMAIL
        }
      });
    }

    // Create email transporter
    const transporter = createTransporter();

    // Get all reminders for today
    const allTodaysReminders = getAllTodaysReminders();
    const today = getTodaysDate();

    if (allTodaysReminders.length === 0) {
      // No medications today - send consolidated email
      console.log(`No reminders for today (${today}), sending "no medications" email`);

      try {
        const dataPath = join(process.cwd(), 'data');
        const files = readdirSync(dataPath).filter(f => f.endsWith('.json'));
        const pigCount = files.length;

        const mailOptions = {
          from: `"🐷 Pig Farm Reminders" <${GMAIL_USER}>`,
          to: NOTIFICATION_EMAIL,
          subject: `✅ Farm Update - No Medications Today (${today})`,
          html: generateNoMedicationEmail(pigCount)
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', info.messageId);

        return res.status(200).json({
          success: true,
          message: 'No medications today - Email sent',
          timestamp: new Date().toISOString(),
          date: today,
          totalPigs: pigCount,
          messageType: 'no_medications',
          recipient: NOTIFICATION_EMAIL,
          messageId: info.messageId
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return res.status(500).json({
          error: 'Failed to send email',
          message: emailError.message
        });
      }
    }

    // Medications found - send reminder email
    console.log(`Found ${allTodaysReminders.length} reminder(s) for today (${today})`);

    try {
      const mailOptions = {
        from: `"🐷 Pig Farm Reminders" <${GMAIL_USER}>`,
        to: NOTIFICATION_EMAIL,
        subject: `💊 ${allTodaysReminders.length} Medication(s) Today (${today})`,
        html: generateMedicationEmail(allTodaysReminders)
      };

      const info = await transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', info.messageId);

      return res.status(200).json({
        success: true,
        message: `Email sent with ${allTodaysReminders.length} medication reminder(s)`,
        timestamp: new Date().toISOString(),
        date: today,
        totalReminders: allTodaysReminders.length,
        messageType: 'medications',
        recipient: NOTIFICATION_EMAIL,
        messageId: info.messageId,
        reminders: allTodaysReminders.map(r => ({
          name: r.name,
          tablet: r.reminder.tablet,
          time: r.reminder.time
        }))
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({
        error: 'Failed to send email',
        message: emailError.message
      });
    }

  } catch (error) {
    console.error('Error in email-send handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

