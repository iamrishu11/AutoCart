import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PaymanOAuthTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testOAuthFlow = async () => {
    setLoading(true);
    try {
      // This is the URL your frontend would redirect to
      const authUrl = `https://app.paymanai.com/oauth/authorize?client_id=${import.meta.env.VITE_PAYMAN_CLIENT_ID}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_PAYMAN_REDIRECT_URI!)}&response_type=code&scope=${encodeURIComponent('read_balance read_list_payees write_create_payee write_send_payment')}`;
      
      console.log('Auth URL:', authUrl);
      setResult({ authUrl });
      
      // In a real app, this would redirect the user
      // For testing, we'll just show the URL
      toast.info('Check console for OAuth URL');
      
    } catch (error) {
      console.error('OAuth test failed:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testDirectBackendCall = async () => {
    setLoading(true);
    try {
      // Test calling your Render backend directly
      const response = await fetch('https://autocart-backend-8o8e.onrender.com/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: 'test-code-123' })
      });
      
      const data = await response.json();
      console.log('Backend response:', data);
      setResult({ backendResponse: data, status: response.status });
      
    } catch (error) {
      console.error('Backend test failed:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Payman OAuth Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify({
              VITE_PAYMAN_CLIENT_ID: import.meta.env.VITE_PAYMAN_CLIENT_ID,
              VITE_PAYMAN_REDIRECT_URI: import.meta.env.VITE_PAYMAN_REDIRECT_URI,
            }, null, 2)}
          </pre>
        </div>

        <div className="space-x-2">
          <Button onClick={testOAuthFlow} disabled={loading}>
            Test OAuth URL Generation
          </Button>
          <Button onClick={testDirectBackendCall} disabled={loading}>
            Test Backend Call
          </Button>
        </div>

        {result && (
          <div>
            <h2 className="text-lg font-semibold">Result:</h2>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymanOAuthTest;
