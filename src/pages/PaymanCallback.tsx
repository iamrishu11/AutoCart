import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymanCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Since we're using direct redirect instead of popup,
    // this component is not needed for the OAuth flow.
    // Just redirect to dashboard if someone lands here.
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirecting to Dashboard
        </h2>
        <p className="text-gray-600">
          Please wait...
        </p>
      </div>
    </div>
  );
};

export default PaymanCallback;