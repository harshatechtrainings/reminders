import React, { useState } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Function to call the /api/sms-send endpoint
   * This is useful for testing before the cron job triggers
   */
  const sendSMS = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      // Call the API endpoint
      // In production: uses your Vercel domain /api/sms-send
      // In development: uses local API server http://localhost:3001/api/sms-send
      const apiUrl = process.env.REACT_APP_API_URL 
        ? `${process.env.REACT_APP_API_URL}/api/sms-send`
        : '/api/sms-send';
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
        setError(null);
      } else {
        setError(data);
        setResponse(null);
      }
    } catch (err) {
      setError({
        error: 'Failed to connect to API',
        message: err.message
      });
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="card">
          <div className="header">
            <h1>📱 SMS Bot Tester</h1>
            <p className="subtitle">
              Test your Twilio SMS integration before the cron job runs
            </p>
          </div>

          <div className="content">
            <div className="info-box">
              <h3>🕐 Scheduled Time</h3>
              <p>Daily at 09:00 UTC (2:30 PM IST)</p>
            </div>

            <button 
              className={`send-button ${loading ? 'loading' : ''}`}
              onClick={sendSMS}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending SMS...
                </>
              ) : (
                <>
                  📨 Send Test SMS Now
                </>
              )}
            </button>

            {response && (
              <div className="response-box success">
                <h3>✅ Success! SMS Sent</h3>
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </div>
            )}

            {error && (
              <div className="response-box error">
                <h3>❌ Error</h3>
                <pre>{JSON.stringify(error, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="footer">
            <p>
              💡 Make sure you've set up your environment variables in Vercel:
            </p>
            <ul>
              <li><code>TWILIO_ACCOUNT_SID</code></li>
              <li><code>TWILIO_AUTH_TOKEN</code></li>
              <li><code>TWILIO_MESSAGING_SERVICE_SID</code> (or TWILIO_PHONE_NUMBER)</li>
              <li><code>RECIPIENT</code></li>
              <li><code>MESSAGE_TEXT</code> (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;



