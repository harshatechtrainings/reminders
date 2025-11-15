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

import { readFileSync } from 'fs';
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
 * Check if there's a reminder for today
 */
function getTodaysReminder() {
  try {
    const remindersPath = join(process.cwd(), 'reminders.json');
    const remindersData = readFileSync(remindersPath, 'utf8');
    const reminders = JSON.parse(remindersData);
    
    const todaysDate = getTodaysDate();
    const todaysReminder = reminders.reminders.find(r => r.date === todaysDate);
    
    return todaysReminder;
  } catch (error) {
    console.error('Error reading reminders.json:', error);
    return null;
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
    const RECIPIENT = process.env.RECIPIENT;
    
    // Check if there's a reminder for today
    const todaysReminder = getTodaysReminder();
    
    let MESSAGE_TEXT;
    if (todaysReminder) {
      // Build message from reminder data
      MESSAGE_TEXT = `📋 Daily Reminder!\n\n💊 Tablet: ${todaysReminder.tablet}\n🕐 Time: ${todaysReminder.time}\n📝 Notes: ${todaysReminder.notes}`;
      console.log(`Found reminder for today (${getTodaysDate()}):`, todaysReminder);
    } else {
      // No reminder for today - check if we should send a default message
      const sendDefaultMessage = process.env.SEND_DEFAULT_MESSAGE !== 'false';
      
      if (!sendDefaultMessage) {
        return res.status(200).json({
          success: true,
          message: 'No reminder for today',
          date: getTodaysDate(),
          skipped: true
        });
      }
      
      MESSAGE_TEXT = process.env.MESSAGE_TEXT || 'Daily update ✅ - No specific reminder for today!';
      console.log(`No reminder found for today (${getTodaysDate()}), using default message`);
    }

    // Validate required environment variables
    // Either MessagingServiceSid OR PhoneNumber is required (not both)
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !RECIPIENT) {
      return res.status(500).json({
        error: 'Missing required environment variables',
        required: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'RECIPIENT', 'TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER'],
        missing: {
          TWILIO_ACCOUNT_SID: !TWILIO_ACCOUNT_SID,
          TWILIO_AUTH_TOKEN: !TWILIO_AUTH_TOKEN,
          RECIPIENT: !RECIPIENT
        }
      });
    }

    if (!TWILIO_MESSAGING_SERVICE_SID && !TWILIO_PHONE_NUMBER) {
      return res.status(500).json({
        error: 'Missing sender configuration',
        message: 'You must provide either TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER'
      });
    }

    console.log(`[${new Date().toISOString()}] Sending SMS to ${RECIPIENT}`);

    // Twilio API endpoint
    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Create Basic Auth header
    const authHeader = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    // Prepare the SMS payload
    const formData = new URLSearchParams();
    
    // Use MessagingServiceSid if provided, otherwise use From phone number
    if (TWILIO_MESSAGING_SERVICE_SID) {
      formData.append('MessagingServiceSid', TWILIO_MESSAGING_SERVICE_SID);
      console.log('Using Messaging Service SID:', TWILIO_MESSAGING_SERVICE_SID);
    } else {
      formData.append('From', TWILIO_PHONE_NUMBER);
      console.log('Using From phone number:', TWILIO_PHONE_NUMBER);
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
      console.error('Twilio API Error:', responseData);
      return res.status(response.status).json({
        error: 'Failed to send SMS',
        details: responseData
      });
    }

    console.log('SMS sent successfully:', responseData);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      timestamp: new Date().toISOString(),
      date: getTodaysDate(),
      reminder: todaysReminder || null,
      recipient: RECIPIENT,
      messageId: responseData.sid,
      status: responseData.status,
      twilioResponse: {
        sid: responseData.sid,
        status: responseData.status,
        to: responseData.to,
        from: responseData.from,
        dateCreated: responseData.date_created
      }
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



