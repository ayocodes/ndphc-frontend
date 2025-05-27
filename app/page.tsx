'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/library/store/auth-store';

export default function Home() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token && user && user.is_active) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router, token, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
