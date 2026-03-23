'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { searchFichas, getPunicoesByFicha, TIPO_LABELS, TIPO_COLORS, formatDate } from '@/lib/store';
import { FichaCriminal, Punicao } from '@/types';
import { Search, AlertTriangle, FilePlus, ChevronRight, FileText } from 'lucide-react';

function BuscarContent() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [results, setResults] = useState<Array<{ ficha: FichaCriminal; punicoes: Punicao[] }>>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get('q')) doSearch(params.get('q')!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(q: string) {
    if (q.trim().length < 2) return;
    setLoading(true);
    const fichas = await searchFichas(q);
    const withPunicoes = await Promise.all(
      fichas.map(async f => ({ ficha: f, punicoes: await getPunicoesByFicha(f.id) }))
    );
    setResults(withPunicoes);
    setSearched(true);
    setLoading(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') doSearch(query);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-7 fade-up">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-red-500" />
          <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest">Consulta de Fichas</span>
        </div>
        <h1 className="font-['Bebas_Neue'] text-5xl text-white tracking-widest">BUSCAR FICHA</h1>
      </div>

      <div className="bg-[#0d0d18] border border-[#1a1a2e] p-5 mb-5 fade-up">
        <label className="label">Nick no Minecraft, Discord ou ID do Discord</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3a5c]" />
            <input value={query} onChange={e => { setQuery(e.target.value); if (!e.target.value) setSearched(false); }}
              onKeyDown={handleKey} placeholder="Digite o nick ou ID..." className="pl-10" autoFocus />
          </div>
          <button onClick={() => doSearch(query)}
            className="px-5 bg-red-700 hover:bg-red-600 text-white font-mono text-xs uppercase tracking-widest transition-all shrink-0">
            Buscar
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 font-mono text-xs text-[#3a3a5c] animate-pulse">Buscando...</div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="bg-[#0d0d18] border border-[#1a1a2e] py-14 text-center fade-up">
          <AlertTriangle className="w-9 h-9 text-[#2a2a3c] mx-auto mb-3" />
          <p className="font-['Bebas_Neue'] text-2xl text-[#8888aa] tracking-widest mb-1">NENHUMA FICHA ENCONTRADA</p>
          <p className="font-mono text-xs text-[#3a3a5c] mb-5">
            Nenhum registro para <span className="text-white">"{query}"</span>
          </p>
          <Link href="/fichas/nova-punicao"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white font-mono text-xs uppercase tracking-widest transition-all">
            <FilePlus className="w-4 h-4" /> Registrar Punição
          </Link>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4 fade-up">
          <p className="font-mono text-xs text-[#8888aa]">
            <span className="text-white">{results.length}</span> ficha(s) encontrada(s)
          </p>
          {results.map(({ ficha, punicoes }) => (
            <Link key={ficha.id} href={`/fichas/${ficha.id}`}
              className="block bg-[#0d0d18] border border-[#1a1a2e] hover:border-[#c8102e]/40 transition-all group">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a2e]">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#3a3a5c] group-hover:text-red-400 transition-colors" />
                  <div>
                    <span className="text-white font-semibold group-hover:text-red-300 transition-colors">{ficha.nickMinecraft}</span>
                    <span className="font-mono text-xs text-[#8888aa] ml-2">/ {ficha.nickDiscord}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#8888aa]">
                    <span className="text-red-400 font-bold">{punicoes.length}</span> punição(ões)
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#3a3a5c] group-hover:text-red-400 transition-colors" />
                </div>
              </div>
              {punicoes.slice(-2).reverse().map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-[#1a1a2e] last:border-0">
                  <span className={`badge shrink-0 ${TIPO_COLORS[p.tipo]}`}>{TIPO_LABELS[p.tipo]}</span>
                  <span className="font-mono text-xs text-[#8888aa] flex-1 truncate">{p.motivo}</span>
                  <span className="font-mono text-[10px] text-[#3a3a5c] shrink-0">{formatDate(p.dataPunicao)}</span>
                </div>
              ))}
            </Link>
          ))}
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-16 text-[#2a2a3c] fade-up">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-mono text-xs">Aguardando busca...</p>
        </div>
      )}
    </main>
  );
}

export default function BuscarPage() {
  return (
    <AuthGuard>
      <Navbar />
      <Suspense>
        <BuscarContent />
      </Suspense>
    </AuthGuard>
  );
}