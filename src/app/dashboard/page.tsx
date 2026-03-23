'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { getSession, getFichas, getPunicoes, TIPO_LABELS, TIPO_COLORS, formatDate } from '@/lib/store';
import { AuthSession, FichaCriminal, Punicao } from '@/types';
import { Search, FilePlus, AlertTriangle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [fichas, setFichas] = useState<FichaCriminal[]>([]);
  const [punicoes, setPunicoes] = useState<Punicao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    Promise.all([getFichas(), getPunicoes()]).then(([f, p]) => {
      setFichas(f);
      setPunicoes(p);
      setLoading(false);
    });
  }, []);

  const recentes = [...punicoes].sort((a, b) => b.dataPunicao.localeCompare(a.dataPunicao)).slice(0, 6);
  const counts = {
    mute:           punicoes.filter(p => p.tipo === 'mute').length,
    ban_temporario: punicoes.filter(p => p.tipo === 'ban_temporario').length,
    ban_permanente: punicoes.filter(p => p.tipo === 'ban_permanente').length,
  };

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="fade-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />
            <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest">Sistema Online</span>
          </div>
          <h1 className="font-['Bebas_Neue'] text-5xl text-white tracking-widest">
            PUNIÇÕES DO JC
          </h1>
          <p className="font-mono text-xs text-[#8888aa] mt-1">
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 fade-up">
          {[
            { label: 'Fichas', value: fichas.length,                                 color: 'text-white'    },
            { label: 'Mutes',  value: counts.mute,                                   color: 'text-blue-400' },
            { label: 'Bans',   value: counts.ban_temporario + counts.ban_permanente, color: 'text-red-400'  },
          ].map(s => (
            <div key={s.label} className="corner bg-[#0d0d18] border border-[#1a1a2e] p-4">
              <div className="font-mono text-[10px] text-[#8888aa] uppercase tracking-widest">{s.label}</div>
              <div className={`font-['Bebas_Neue'] text-4xl ${s.color} mt-1`}>
                {loading ? '—' : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-2 gap-3 fade-up">
          <Link href="/fichas/nova-punicao"
            className="flex items-center gap-4 p-5 bg-red-950/20 border border-red-900/40 hover:bg-red-950/30 transition-all group">
            <FilePlus className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-['Bebas_Neue'] text-2xl text-red-400 tracking-widest">REGISTRAR PUNIÇÃO</div>
              <div className="font-mono text-xs text-[#8888aa]">Criar ficha nova ou adicionar a existente</div>
            </div>
          </Link>
          <Link href="/fichas/buscar"
            className="flex items-center gap-4 p-5 bg-[#0d0d18] border border-[#1a1a2e] hover:border-[#2a2a4a] transition-all group">
            <Search className="w-6 h-6 text-[#8888aa] group-hover:text-white group-hover:scale-110 transition-all" />
            <div>
              <div className="font-['Bebas_Neue'] text-2xl text-white tracking-widest">BUSCAR FICHA</div>
              <div className="font-mono text-xs text-[#8888aa]">Consultar por nick ou Discord</div>
            </div>
          </Link>
        </div>

        {/* Recent */}
        <div className="bg-[#0d0d18] border border-[#1a1a2e] fade-up">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a2e]">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span className="font-mono text-[10px] text-[#8888aa] uppercase tracking-widest">Punições Recentes</span>
            </div>
            <Link href="/fichas/buscar" className="font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors">
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center font-mono text-xs text-[#3a3a5c] animate-pulse">Carregando...</div>
          ) : recentes.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="w-8 h-8 text-[#2a2a3c] mx-auto mb-3" />
              <p className="font-mono text-xs text-[#3a3a5c]">Nenhuma punição registrada ainda</p>
              <Link href="/fichas/nova-punicao" className="font-mono text-xs text-red-500 hover:underline mt-2 inline-block">
                Registrar primeira →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1a1a2e]">
              {recentes.map(p => (
                <Link key={p.id} href={`/fichas/buscar?q=${encodeURIComponent(p.nickMinecraft)}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#111122] transition-colors group">
                  <span className={`badge ${TIPO_COLORS[p.tipo]} shrink-0`}>{TIPO_LABELS[p.tipo]}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium group-hover:text-red-300 transition-colors">{p.nickMinecraft}</span>
                    <span className="font-mono text-xs text-[#8888aa] ml-2">/ {p.nickDiscord}</span>
                    <div className="font-mono text-xs text-[#3a3a5c] truncate mt-0.5">{p.motivo}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-[10px] text-[#8888aa]">{formatDate(p.dataPunicao)}</div>
                    <div className="font-mono text-[10px] text-[#3a3a5c]">{p.aplicadoPor}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}