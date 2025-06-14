import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymanCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    console.log('OAuth callback received:', { code, error });

    if (window.opener) {
      try {
        window.opener.postMessage(
          {
            type: 'payman-oauth-redirect',
            redirectUri: window.location.href,
            code,
            error,
          },
          window.location.origin
        );
        console.log('OAuth callback message sent to parent window');
        setTimeout(() => window.close(), 1000);
      } catch (err) {
        console.error('Error sending message to parent window:', err);
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      }
    } else {
      if (code) {
        sessionStorage.setItem('payman_oauth_code', code);
      }
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Processing Payman Authentication
        </h2>
        <p className="text-gray-600 mb-4">
          Please wait while we complete your authentication...
        </p>
        <div className="bg-purple-50 p-3 rounded border border-purple-200">
          <p className="text-sm text-purple-700">
            This window will close automatically once authentication is complete.
          </p>
        </div>
        <button
          onClick={() => window.close()}
          className="mt-4 text-sm text-purple-600 hover:underline"
        >
          Close this window manually
        </button>
      </div>
    </div>
  );
};

export default PaymanCallback;