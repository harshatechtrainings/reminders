/**
 * Vercel Serverless Function for sending SMS messages via Twilio
 * This function is triggered by:
 * 1. Vercel Cron (daily at 09:00 UTC / 2:30 PM IST)
 * 2. Manual API calls (for testing)
 * 
 * Features:
 * - Reads reminders.json file for tablet reminders
 * - Checks if today's date has a reminder
 * - Sends SMS with tablet information if reminder exists
 */

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
    const dataPath = join(process.cwd(), 'data');
    const files = readdirSync(dataPath).filter(f => f.endsWith('.json'));
    
    const todaysDate = getTodaysDate();
    const allReminders = [];
    
    for (const file of files) {
      try {
        const filePath = join(dataPath, file);
        const fileData = readFileSync(filePath, 'utf8');
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
        console.error(`Error reading ${file}:`, fileError.message);
      }
    }
    
    return allReminders;
  } catch (error) {
    console.error('Error reading reminders from data folder:', error);
    return [];
  }
}

export default async function handler(req, res) {
  // Set CORS headers for frontend testing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['GET', 'POST'] 
    });
  }

  try {
    // Read environment variables from Vercel
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
    
    // Get all reminders for today from all JSON files
    const allTodaysReminders = getAllTodaysReminders();
    
    if (allTodaysReminders.length === 0) {
      // No reminders for today
      const sendDefaultMessage = process.env.SEND_DEFAULT_MESSAGE !== 'false';
      
      if (!sendDefaultMessage) {
        return res.status(200).json({
          success: true,
          message: 'No reminders for today',
          date: getTodaysDate(),
          skipped: true
        });
      }
      
      console.log(`No reminders found for today (${getTodaysDate()})`);
      return res.status(200).json({
        success: true,
        message: 'No reminders scheduled for today',
        date: getTodaysDate()
      });
    }
    
    console.log(`Found ${allTodaysReminders.length} reminder(s) for today (${getTodaysDate()})`);
    
    // Send SMS to each person with a reminder
    const results = [];
    
    for (const { name, phone, dob, reminder, source } of allTodaysReminders) {
      const ageInfo = formatAgeInfo(dob);
      const MESSAGE_TEXT = `📋 Hello ${name}!${ageInfo}\n\n💊 Tablet: ${reminder.tablet}\n🕐 Time: ${reminder.time}\n📝 Notes: ${reminder.notes}`;
      const RECIPIENT = phone;

      // Validate required environment variables
      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        results.push({
          name,
          phone,
          success: false,
          error: 'Missing Twilio credentials'
        });
        continue;
      }

      if (!TWILIO_MESSAGING_SERVICE_SID && !TWILIO_PHONE_NUMBER) {
        results.push({
          name,
          phone,
          success: false,
          error: 'Missing sender configuration'
        });
        continue;
      }

      console.log(`[${new Date().toISOString()}] Sending SMS to ${name} (${RECIPIENT})`);

      try {
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

        // Send POST request to Twilio API
        const response = await fetch(twilioApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        });

        const responseData = await response.json();

        // Check if the request was successful
        if (!response.ok) {
          console.error(`SMS failed for ${name}:`, responseData);
          results.push({
            name,
            phone,
            success: false,
            error: responseData.message || 'Failed to send SMS',
            reminder: reminder
          });
        } else {
          console.log(`SMS sent successfully to ${name}:`, responseData.sid);
          results.push({
            name,
            phone,
            success: true,
            messageId: responseData.sid,
            status: responseData.status,
            reminder: reminder
          });
        }
      } catch (smsError) {
        console.error(`Error sending SMS to ${name}:`, smsError);
        results.push({
          name,
          phone,
          success: false,
          error: smsError.message,
          reminder: reminder
        });
      }
    }

    // Return summary of all SMS sent
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    return res.status(200).json({
      success: successCount > 0,
      message: `Sent ${successCount} SMS, ${failCount} failed`,
      timestamp: new Date().toISOString(),
      date: getTodaysDate(),
      totalReminders: results.length,
      successCount,
      failCount,
      results
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}



