import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../conext/AppContext';

const Loader = () => {
  const { navigate } = useAppContext();
  const { nextUrl } = useParams();

  useEffect(() => {
    if (nextUrl) {
      const timer = setTimeout(() => {
        navigate(`/${nextUrl}`);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [nextUrl]);

  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='h-24 w-24 animate-spin rounded-full border-4 border-gray-300 border-t-primary'></div>
    </div>
  );
};

export default Loader;