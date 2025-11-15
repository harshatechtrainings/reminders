/**
 * Simple Express server for local testing
 * Run with: node server-local.js
 * Then test: http://localhost:3001/api/sms-send
 */

import dotenv from 'dotenv';
import express from 'express';
import smsHandler from './api/sms-send.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// API route
app.get('/api/sms-send', (req, res) => {
  smsHandler(req, res);
});

app.post('/api/sms-send', (req, res) => {
  smsHandler(req, res);
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'SMS Bot API Server',
    endpoints: {
      'GET/POST /api/sms-send': 'Send SMS via Twilio'
    }
  });
});

app.listen(PORT, () => {
  console.log('\n🚀 Local API server running!');
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → API: http://localhost:${PORT}/api/sms-send\n`);
  console.log('📱 Test with:');
  console.log(`   curl -X POST http://localhost:${PORT}/api/sms-send\n`);
});

