import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Session } from '@supabase/supabase-js';

export default function Callback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        const {
          data: { session },
          error,
        }: { data: { session: Session | null }; error: any } = await supabase.auth.getSession();

        if (error) {
          console.error('Error setting session:', error);
          toast({
            title: 'Authentication Error',
            description: 'Failed to authenticate. Please try again.',
            variant: 'destructive',
          });
          navigate('/auth');
          return;
        }

        if (session) {
          console.log('User authenticated:', session.user);
          window.location.hash = '';
          navigate('/dashboard');
        } else {
          console.error('No session found');
          toast({
            title: 'Authentication Failed',
            description: 'No session found. Please try again.',
            variant: 'destructive',
          });
          navigate('/auth');
        }
      } else {
        console.error('No access token found');
        toast({
          title: 'Authentication Failed',
          description: 'Invalid authentication response.',
          variant: 'destructive',
        });
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return <div>Loading...</div>;
}