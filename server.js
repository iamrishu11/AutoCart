import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.server' });

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'https://auto-cart.vercel.app'],
  credentials: true
}));

app.use(express.json());

// OAuth token exchange endpoint
app.post('/api/oauth/token', async (req, res) => {
  try {
    console.log('=== Token Exchange Request ===');
    console.log('Request body:', req.body);
    
    const { code } = req.body;
    
    if (!code) {
      console.log('Error: Missing authorization code');
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Attempting to exchange code:', code);
    console.log('Using client ID:', process.env.PAYMAN_CLIENT_ID);
    console.log('Using client secret:', process.env.PAYMAN_CLIENT_SECRET ? 'Present' : 'Missing');

    // Try dynamic import of PaymanClient first
    let tokenResponse;
    try {
      const pkg = await import('@paymanai/payman-ts');
      const { PaymanClient } = pkg;
      
      console.log('Creating PaymanClient with auth code...');
      const client = PaymanClient.withAuthCode(
        {
          clientId: process.env.PAYMAN_CLIENT_ID,
          clientSecret: process.env.PAYMAN_CLIENT_SECRET,
        },
        code
      );

      console.log('Getting access token...');
      tokenResponse = await client.getAccessToken();
      console.log('Token response from PaymanClient:', tokenResponse);
      
    } catch (sdkError) {
      console.error('PaymanClient SDK failed, trying direct API call:', sdkError);
      
      // Fallback to direct API call
      const apiResponse = await fetch('https://app.paymanai.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.PAYMAN_CLIENT_ID}:${process.env.PAYMAN_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
        })
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('Direct API call failed:', errorText);
        throw new Error(`API call failed: ${errorText}`);
      }

      tokenResponse = await apiResponse.json();
      console.log('Token response from direct API:', tokenResponse);
    }

    // Handle different possible response formats
    const accessToken = tokenResponse.accessToken || tokenResponse.access_token;
    const expiresIn = tokenResponse.expiresIn || tokenResponse.expires_in || 3600;

    if (!accessToken) {
      console.error('No access token in response:', tokenResponse);
      return res.status(500).json({ 
        error: 'No access token received',
        response: tokenResponse
      });
    }

    console.log('Token exchange successful!');
    res.json({
      accessToken,
      expiresIn,
      success: true
    });

  } catch (error) {
    console.error('=== Token Exchange Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error object:', error);
    
    res.status(500).json({ 
      error: 'Token exchange failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// OAuth callback endpoint (for direct redirects)
app.get('/api/oauth/callback', async (req, res) => {
  console.log('=== OAuth Callback ===');
  console.log('Query params:', req.query);
  
  const { code, error, error_description, state } = req.query;

  if (error) {
    console.log('OAuth error received:', error, error_description);
    // Redirect to frontend with error details
    return res.redirect(
      `http://localhost:8080/dashboard?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || '')}`
    );
  }

  if (!code) {
    console.log('No authorization code received');
    return res.redirect(
      `http://localhost:8080/dashboard?error=no_code&error_description=${encodeURIComponent('No authorization code received')}`
    );
  }

  try {
    console.log('Exchanging code for token via internal endpoint...');
    // Use our own token exchange endpoint
    const response = await fetch(`http://localhost:${PORT}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    console.log('Internal token exchange result:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Token exchange failed');
    }

    // Redirect to frontend with the access token
    const redirectUrl = `http://localhost:8080/dashboard?access_token=${encodeURIComponent(data.accessToken)}&expires_in=${encodeURIComponent(data.expiresIn)}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(
      `http://localhost:8080/dashboard?error=token_exchange_failed&error_description=${encodeURIComponent(error.message)}`
    );
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      PAYMAN_CLIENT_ID: process.env.PAYMAN_CLIENT_ID ? 'Present' : 'Missing',
      PAYMAN_CLIENT_SECRET: process.env.PAYMAN_CLIENT_SECRET ? 'Present' : 'Missing',
    }
  });
});

// Test endpoint to generate OAuth URL
app.get('/test-oauth-url', async (req, res) => {
  try {
    console.log('\n=== Generating OAuth URL ===');
    console.log('Client ID:', process.env.PAYMAN_CLIENT_ID);
    console.log('Redirect URI: http://localhost:8080/oauth/callback');
    
    const { PaymanClient } = await import('@paymanai/payman-ts');
    
    const client = new PaymanClient({
      clientId: process.env.PAYMAN_CLIENT_ID,
      redirectUri: 'http://localhost:8080/oauth/callback'
    });
    
    const oauthUrl = client.generateOAuthUrl();
    console.log('Generated OAuth URL:', oauthUrl);
    
    res.json({ 
      success: true, 
      oauthUrl,
      instructions: 'Visit this URL in your browser to complete OAuth flow',
      steps: [
        '1. Click the OAuth URL',
        '2. Complete authorization in Payman',
        '3. You will be redirected back with a real code',
        '4. Use that real code to test token exchange'
      ]
    });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`=== Payman OAuth Server Started ===`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment check:`);
  console.log(`  PAYMAN_CLIENT_ID: ${process.env.PAYMAN_CLIENT_ID || 'Missing'}`);
  console.log(`  PAYMAN_CLIENT_SECRET: ${process.env.PAYMAN_CLIENT_SECRET ? 'Present' : 'Missing'}`);
});
