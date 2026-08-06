"use client";

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function LoginForm() {
  const router = useRouter();

  useEffect(() => {
    // Standard /login route is disabled and hidden from hackers. Redirect to homepage /
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712] flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

