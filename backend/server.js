import express from 'express';
import { PaymanClient } from '@paymanai/payman-ts';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS configuration for local frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

app.post('/api/oauth/token', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Received OAuth code:', code);

    const client = PaymanClient.withAuthCode(
      {
        clientId: process.env.PAYMAN_CLIENT_ID,
        clientSecret: process.env.PAYMAN_CLIENT_SECRET,
      },
      code
    );

    const tokenResponse = await client.getAccessToken();

    res.json({
      accessToken: tokenResponse.accessToken,
      expiresIn: tokenResponse.expiresIn,
    });
  } catch (error) {
    console.error('Token exchange failed:', error);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
