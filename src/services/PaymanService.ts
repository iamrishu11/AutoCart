import { PaymanClient } from '@paymanai/payman-ts';
import { toast } from "sonner";

class PaymanService {
  private client: PaymanClient;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private isInitialized: boolean = false;

  private readonly clientId = import.meta.env.VITE_PAYMAN_CLIENT_ID;
  private readonly scopes = 'read_balance read_list_payees write_create_payee write_send_payment';
  private readonly apiBaseUrl = 'https://autocart-backend-8o8e.onrender.com';

  constructor() {
    // Initialize with just client ID for token-based operations
    this.client = PaymanClient.withToken(this.clientId, {
      accessToken: '',
      expiresIn: 0
    });
    this.initializeSync();
  }

  private initializeSync() {
    if (this.isInitialized) return;
    const token = localStorage.getItem('payman_access_token');
    const expiry = localStorage.getItem('payman_token_expiry');
    if (token && expiry) {
      const expiryTime = parseInt(expiry);
      if (Date.now() < expiryTime) {
        this.accessToken = token;
        this.tokenExpiry = expiryTime;
        // Initialize client with user token
        this.client = PaymanClient.withToken(this.clientId, {
          accessToken: token,
          expiresIn: (expiryTime - Date.now()) / 1000,
        });
        console.log('PaymanService: Token loaded from storage');
      } else {
        this.clearAuth();
        console.log('PaymanService: Expired token cleared');
      }
    }
    this.isInitialized = true;
  }

  isAuthenticated(): boolean {
    this.initializeSync();
    if (!this.accessToken || !this.tokenExpiry) return false;
    if (Date.now() >= this.tokenExpiry) {
      this.clearAuth();
      return false;
    }
    return true;
  }

  getOAuthAuthorizationUrl(redirectUri: string): string {
    const authUrl = new URL('https://app.paymanai.com/oauth/authorize');
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', this.scopes);
    authUrl.searchParams.set('response_type', 'code');
    return authUrl.toString();
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      console.log('Exchanging OAuth code:', code);
      
      // Call backend API to exchange code for token
      const response = await fetch(`${this.apiBaseUrl}/api/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Token exchange failed');
      }

      const tokenResponse = await response.json();
      
      this.initializeWithTokenPrivate(tokenResponse.accessToken, tokenResponse.expiresIn);
      
      return {
        accessToken: tokenResponse.accessToken,
        expiresIn: tokenResponse.expiresIn,
      };
    } catch (error) {
      console.error('Token exchange failed:', error);
      toast.error('Failed to authenticate with Payman.');
      throw error;
    }
  }

  private initializeWithTokenPrivate(accessToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.tokenExpiry = Date.now() + expiresIn * 1000;
    localStorage.setItem('payman_access_token', accessToken);
    localStorage.setItem('payman_token_expiry', this.tokenExpiry.toString());
    // Initialize client with user token
    this.client = PaymanClient.withToken(this.clientId, {
      accessToken,
      expiresIn,
    });
    console.log('PaymanService: Initialized with new user token');
  }

  // Public method to initialize with token (called from Dashboard)
  initializeWithToken(accessToken: string, expiresIn: number) {
    this.initializeWithTokenPrivate(accessToken, expiresIn);
  }

  private clearAuth() {
    this.accessToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('payman_access_token');
    localStorage.removeItem('payman_token_expiry');
    // Reset client without token
    this.client = PaymanClient.withToken(this.clientId, {
      accessToken: '',
      expiresIn: 0
    });
    console.log('PaymanService: Authentication cleared');
  }

  async createPayee(email: string, name: string): Promise<void> {
    try {
      const message = `Add payee with email ${email} and name "${name}"`;
      console.log('Creating payee:', message);
      await this.client.ask(message, {
        metadata: { source: 'autocart', type: 'payee-creation', email, name },
      });
      console.log('Payee created successfully');
    } catch (error) {
      console.error('Error creating payee:', error);
      throw error;
    }
  }

  async sendPayment(amount: number, recipientName: string, productId: string, orderId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    try {
      const message = `pay ${amount} tds to ${recipientName}`;
      const response = await this.client.ask(message, {
        metadata: {
          source: 'autocart',
          type: 'purchase-payment',
          recipient: recipientName,
          amount,
          currency: 'TSD',
          productId,
          orderId,
        },
      });
      if (response.status !== 'completed') {
        throw new Error('Payment failed');
      }
      console.log('Payment sent successfully from user account:', response);
    } catch (error) {
      console.error('Error sending payment:', error);
      throw error;
    }
  }

  async getWalletBalance(): Promise<string> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    try {
      const balance = await this.client.ask("what's my wallet balance?");
      // If balance is an object, extract the string value
      if (typeof balance === 'string') {
        return balance;
      } else if (balance && typeof balance === 'object' && 'result' in balance) {
        return (balance as any).result ?? JSON.stringify(balance);
      } else {
        return JSON.stringify(balance);
      }
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }
}

export const paymanService = new PaymanService();
