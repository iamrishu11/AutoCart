import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({ origin: "https://auto-cart.vercel.app" }));
app.use(express.json());

app.post('/api/oauth/token', async (req, res) => {
  try {
    const pkg = await import('@paymanai/payman-ts');
    const { PaymanClient } = pkg;

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

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
    res.status(500).json({ error: error.message || 'Token exchange failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
