'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!getSession()) router.replace('/login');
    else setOk(true);
  }, [router]);

  if (!ok) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="font-mono text-xs text-[#3a3a5c] tracking-widest animate-pulse">VERIFICANDO ACESSO...</span>
    </div>
  );
  return <>{children}</>;
}