import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../conext/AppContext';

const Loader = () => {
  const { navigate, axios } = useAppContext();
  const { nextUrl } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('Confirming your payment...');

  useEffect(() => {
    if (!nextUrl) return;

    let cancelled = false;

    const finish = async () => {
      if (sessionId) {
        try {
          const { data } = await axios.get('/api/bookings/verify-payment', {
            params: { session_id: sessionId },
          });

          if (!cancelled && !data.success) {
            setMessage(data.message || 'Payment confirmation pending...');
          }
        } catch {
          if (!cancelled) {
            setMessage('Payment confirmation pending...');
          }
        }
      }

      if (!cancelled) {
        navigate(`/${nextUrl}`);
      }
    };

    const timer = setTimeout(finish, sessionId ? 2000 : 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nextUrl, sessionId, axios, navigate]);

  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4'>
      <div className='h-24 w-24 animate-spin rounded-full border-4 border-gray-300 border-t-primary'></div>
      <p className='text-sm text-gray-500'>{message}</p>
    </div>
  );
};

export default Loader;
