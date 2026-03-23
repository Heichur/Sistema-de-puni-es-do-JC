'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { Lock, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !senha.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    setErro('');

    const result = await login(usuario, senha);

    if (result.ok) {
      router.replace('/dashboard');
    } else {
      setErro(result.erro ?? 'Erro desconhecido.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(200,16,46,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,16,46,.025) 1px,transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-4 fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 border border-red-800/50 bg-red-950/20 mb-4 glow-red rounded-sm overflow-hidden">
            <img src="/imgs/LogoJc.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="font-['Bebas_Neue'] text-5xl text-white tracking-widest">SISTEMA DE PUNIÇÕES</h1>
          <p className="font-mono text-[10px] text-[#3a3a5c] tracking-widest mt-1">PUNIÇÕES DO JC</p>
        </div>

        <div className="corner bg-[#0d0d18] border border-[#1a1a2e] p-7">
          <p className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-6 flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Acesso restrito
          </p>

          {erro && (
            <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/50 px-3 py-2 mb-5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="font-mono text-xs text-red-400">{erro}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3a3a5c]" />
                <input
                  type="text"
                  value={usuario}
                  onChange={e => setUsuario(e.target.value)}
                  autoComplete="username"
                  className="w-full bg-[#0a0a14] border border-[#1a1a2e] text-white font-mono text-sm pl-9 pr-4 py-3 focus:outline-none focus:border-red-800/60 transition-colors placeholder:text-[#2a2a3c]"
                  placeholder="seu_usuario"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3a3a5c]" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-[#0a0a14] border border-[#1a1a2e] text-white font-mono text-sm pl-9 pr-10 py-3 focus:outline-none focus:border-red-800/60 transition-colors placeholder:text-[#2a2a3c]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a3a5c] hover:text-white transition-colors"
                >
                  {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 flex items-center justify-center gap-3 bg-red-900/80 hover:bg-red-800 disabled:opacity-60 text-white font-['Bebas_Neue'] tracking-[.15em] text-2xl transition-all rounded-sm mt-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> VERIFICANDO</>
              ) : (
                <><Lock className="w-5 h-5" /> ENTRAR</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}