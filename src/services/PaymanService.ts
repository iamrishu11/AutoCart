import { PaymanClient } from '@paymanai/payman-ts';
import { toast } from "@/components/ui/use-toast";

class PaymanService {
  private client: PaymanClient;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private isInitialized: boolean = false;

  private readonly clientId = import.meta.env.VITE_PAYMAN_CLIENT_ID;
  private readonly clientSecret = import.meta.env.VITE_PAYMAN_CLIENT_SECRET;
  private readonly scopes = 'read_balance read_list_payees write_create_payee write_send_payment';

  constructor() {
    // Initialize with credentials for non-authenticated operations
    this.client = PaymanClient.withCredentials({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
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
      const authClient = PaymanClient.withAuthCode(
        {
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        },
        code
      );
      const tokenResponse = await authClient.getAccessToken();
      this.initializeWithToken(tokenResponse.accessToken, tokenResponse.expiresIn);
      return {
        accessToken: tokenResponse.accessToken,
        expiresIn: tokenResponse.expiresIn,
      };
    } catch (error) {
      console.error('Token exchange failed:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Failed to authenticate with Payman.',
        variant: 'destructive',
      });
      throw error;
    }
  }

  private initializeWithToken(accessToken: string, expiresIn: number) {
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

  private clearAuth() {
    this.accessToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('payman_access_token');
    localStorage.removeItem('payman_token_expiry');
    this.client = PaymanClient.withCredentials({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
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
}

export const paymanService = new PaymanService();