'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from '@/lib/store';
import { DISCORD_OAUTH_URL } from '@/lib/discord';
import { Lock, AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

const ERROS: Record<string, string> = {
  acesso_negado:   'Você cancelou o login com Discord.',
  token_invalido:  'Erro ao autenticar com Discord. Tente novamente.',
  usuario_invalido:'Não foi possível obter seus dados do Discord.',
};

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const erro = params.get('erro');

  useEffect(() => {
    if (getSession()) router.replace('/dashboard');
  }, [router]);

  function handleDiscordLogin() {
    setLoading(true);
    window.location.href = DISCORD_OAUTH_URL;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(200,16,46,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,16,46,.025) 1px,transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-4 fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 border border-red-800/50 bg-red-950/20 mb-4 glow-red rounded-sm overflow-hidden">
            <img src="/imgs/LogoJc.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="font-['Bebas_Neue'] text-5xl text-white tracking-widest">SISTEMA DE PUNIÇÕES</h1>
          <p className="font-mono text-[10px] text-[#3a3a5c] tracking-widest mt-1">PUNIÇÕES DO JC</p>
        </div>

        {/* Card */}
        <div className="corner bg-[#0d0d18] border border-[#1a1a2e] p-7">
          <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-6 flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Autenticação via Discord
          </p>

          {erro && (
            <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/50 px-3 py-2 mb-5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="font-mono text-xs text-red-400">{ERROS[erro] ?? 'Erro desconhecido.'}</span>
            </div>
          )}

          {/* Botão Discord */}
          <button onClick={handleDiscordLogin} disabled={loading}
            className="w-full py-4 flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-60 text-white font-['Bebas_Neue'] tracking-[.15em] text-2xl transition-all rounded-sm">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> REDIRECIONANDO</>
            ) : (
              <>
                {/* Ícone Discord SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                ENTRAR COM DISCORD
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}