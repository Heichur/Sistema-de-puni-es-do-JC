'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { getFichaById, getPunicoesByFicha, getProvasByPunicao, deletarFicha, TIPO_LABELS, TIPO_COLORS, formatDate } from '@/lib/store';
import { FichaCriminal, Punicao, Prova } from '@/types';
import { AlertTriangle, ChevronLeft, FilePlus, Eye, X, User, Hash, ExternalLink, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';

// ── Modal de detalhes da punição ─────────────────────────────────────────────
function PunicaoModal({ p, provas, onClose }: { p: Punicao; provas: Prova[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-[#0d0d18] border border-[#1a1a2e] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a2e] sticky top-0 bg-[#0d0d18] z-10">
          <div className="flex items-center gap-3">
            <span className={`badge ${TIPO_COLORS[p.tipo]}`}>{TIPO_LABELS[p.tipo]}</span>
            <span className="font-mono text-xs text-[#8888aa]">{formatDate(p.dataPunicao)}</span>
          </div>
          <button onClick={onClose} className="text-[#3a3a5c] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-3">
              <div className="label mb-1.5">Nick Minecraft</div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#3a3a5c] shrink-0" />
                <span className="text-white font-medium text-sm">{p.nickMinecraft}</span>
              </div>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-3">
              <div className="label mb-1.5">Nick Discord</div>
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#3a3a5c] shrink-0" />
                <span className="text-white font-medium text-sm">{p.nickDiscord}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-3">
            <div className="label mb-1">ID Discord</div>
            <span className="font-mono text-sm text-[#8888aa]">{p.idDiscord}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-3">
              <div className="label mb-1">Tipo</div>
              <span className={`badge ${TIPO_COLORS[p.tipo]}`}>{TIPO_LABELS[p.tipo]}</span>
            </div>
            {p.duracao && (
              <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-3">
                <div className="label mb-1">Duração</div>
                <span className="text-white text-sm">{p.duracao}</span>
              </div>
            )}
          </div>
          <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-3">
            <div className="label mb-1.5">Motivo</div>
            <p className="text-[#e0e0f0] text-sm leading-relaxed">{p.motivo}</p>
          </div>
          <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-3">
            <div className="label mb-1">Aplicado por</div>
            <span className="text-white text-sm">{p.aplicadoPor}</span>
          </div>
          {provas.length > 0 ? (
            <div>
              <div className="label mb-2">Provas ({provas.length})</div>
              <div className="grid grid-cols-2 gap-2">
                {provas.map(pr => (
                  <div key={pr.id} className="border border-[#1a1a2e] bg-[#0a0a0f] overflow-hidden">
                    {pr.tipo === 'upload' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pr.url} alt={pr.nome}
                        className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(pr.url, '_blank')} />
                    ) : (
                      <a href={pr.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 hover:bg-[#111122] transition-colors">
                        <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-mono text-[10px] text-blue-400 truncate">{pr.url}</span>
                      </a>
                    )}
                    {pr.tipo === 'upload' && (
                      <div className="px-2 py-1 border-t border-[#1a1a2e]">
                        <p className="font-mono text-[9px] text-[#3a3a5c] truncate">{pr.nome}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#3a3a5c]">
              <ImageIcon className="w-4 h-4" />
              <span className="font-mono text-xs">Nenhuma prova anexada</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal de confirmação de exclusão ─────────────────────────────────────────
function ConfirmDeleteModal({ nome, onConfirm, onCancel, loading }: {
  nome: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm bg-[#0d0d18] border border-red-900/60 shadow-2xl p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-950/50 border border-red-800/60 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="font-['Bebas_Neue'] text-xl text-white tracking-widest">APAGAR FICHA</div>
            <div className="font-mono text-[10px] text-[#8888aa]">Esta ação não pode ser desfeita</div>
          </div>
        </div>

        <p className="font-mono text-sm text-[#8888aa] mb-1">
          Você está prestes a apagar permanentemente a ficha de:
        </p>
        <p className="font-['Bebas_Neue'] text-2xl text-red-400 tracking-widest mb-4">{nome}</p>
        <p className="font-mono text-xs text-[#3a3a5c] mb-6">
          Todas as punições e provas associadas também serão removidas dos dois bancos de dados.
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 border border-[#1a1a2e] text-[#8888aa] hover:text-white font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Apagando...</>
              : <><Trash2 className="w-3.5 h-3.5" />Apagar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function FichaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ficha, setFicha] = useState<FichaCriminal | null>(null);
  const [punicoes, setPunicoes] = useState<Punicao[]>([]);
  const [selected, setSelected] = useState<Punicao | null>(null);
  const [selectedProvas, setSelectedProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const f = await getFichaById(id);
      setFicha(f);
      if (f) setPunicoes(await getPunicoesByFicha(f.id));
      setLoading(false);
    }
    load();
  }, [id]);

  async function openModal(p: Punicao) {
    setSelected(p);
    setSelectedProvas(await getProvasByPunicao(p.id));
  }

  async function handleDelete() {
    if (!ficha) return;
    setDeleting(true);
    await deletarFicha(ficha.id);
    setDeleting(false);
    router.push('/dashboard');
  }

  if (loading) return (
    <AuthGuard><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-mono text-xs text-[#3a3a5c] animate-pulse">
        Carregando ficha...
      </div>
    </AuthGuard>
  );

  if (!ficha) return (
    <AuthGuard><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-[#2a2a3c] mx-auto mb-4" />
        <p className="font-['Bebas_Neue'] text-3xl text-[#8888aa] tracking-widest mb-2">FICHA NÃO ENCONTRADA</p>
        <button onClick={() => router.back()} className="font-mono text-xs text-red-400 hover:underline">← Voltar</button>
      </div>
    </AuthGuard>
  );

  return (
    <AuthGuard>
      <Navbar />

      {selected && (
        <PunicaoModal p={selected} provas={selectedProvas} onClose={() => setSelected(null)} />
      )}

      {showDelete && (
        <ConfirmDeleteModal
          nome={ficha.nickMinecraft}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => router.back()}
          className="flex items-center gap-1 font-mono text-xs text-[#8888aa] hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Header card */}
        <div className="corner bg-[#0d0d18] border border-[#1a1a2e] p-6 mb-5 fade-up">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[10px] text-red-500 uppercase tracking-widest mb-1">
                Ficha #{ficha.id.toUpperCase()}
              </div>
              <h1 className="font-['Bebas_Neue'] text-5xl text-white tracking-widest">{ficha.nickMinecraft}</h1>
              <div className="mt-2 space-y-0.5">
                <div className="flex items-center gap-2 font-mono text-xs text-[#8888aa]">
                  <Hash className="w-3 h-3" />
                  <span>Discord: <span className="text-white">{ficha.nickDiscord}</span></span>
                  <span className="text-[#3a3a5c]">·</span>
                  <span>ID: <span className="text-white font-mono">{ficha.idDiscord}</span></span>
                </div>
                <div className="font-mono text-[10px] text-[#3a3a5c]">
                  Ficha criada em {formatDate(ficha.criadoEm)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-center mr-2">
                <div className="font-['Bebas_Neue'] text-4xl text-red-400">{punicoes.length}</div>
                <div className="font-mono text-[10px] text-[#8888aa] uppercase tracking-widest">punições</div>
              </div>
              <Link href="/fichas/nova-punicao"
                className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-mono text-xs uppercase tracking-widest transition-all">
                <FilePlus className="w-3.5 h-3.5" /> Nova Punição
              </Link>
              <button onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-900/50 text-red-500 hover:bg-red-950/30 font-mono text-xs uppercase tracking-widest transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Apagar Ficha
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de punições */}
        <div className="bg-[#0d0d18] border border-[#1a1a2e] fade-up">
          <div className="px-5 py-3.5 border-b border-[#1a1a2e]">
            <span className="font-mono text-[10px] text-[#8888aa] uppercase tracking-widest">
              Histórico de Punições
            </span>
          </div>

          {punicoes.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-[#3a3a5c]">
              Nenhuma punição registrada
            </div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-2 border-b border-[#1a1a2e] bg-[#0a0a0f]">
                {['#', 'Tipo', 'Motivo', 'Data / Aplicado', ''].map(h => (
                  <span key={h} className="font-mono text-[9px] text-[#3a3a5c] uppercase tracking-widest">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-[#1a1a2e]">
                {punicoes.map((p, idx) => (
                  <button key={p.id} onClick={() => openModal(p)}
                    className="w-full text-left hover:bg-[#111122] transition-colors group">
                    {/* Mobile */}
                    <div className="md:hidden px-5 py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#3a3a5c]">#{idx + 1}</span>
                          <span className={`badge ${TIPO_COLORS[p.tipo]}`}>{TIPO_LABELS[p.tipo]}</span>
                        </div>
                        <Eye className="w-3.5 h-3.5 text-[#3a3a5c] group-hover:text-red-400 transition-colors" />
                      </div>
                      <p className="font-mono text-xs text-[#8888aa] truncate">{p.motivo}</p>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-[#3a3a5c]">
                        <span>{formatDate(p.dataPunicao)}</span>
                        <span>por {p.aplicadoPor}</span>
                      </div>
                    </div>
                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4">
                      <span className="font-mono text-xs text-[#3a3a5c] w-6 text-center">{idx + 1}</span>
                      <div className="flex flex-col gap-1">
                        <span className={`badge w-fit ${TIPO_COLORS[p.tipo]}`}>{TIPO_LABELS[p.tipo]}</span>
                        {p.duracao && <span className="font-mono text-[10px] text-[#8888aa]">{p.duracao}</span>}
                      </div>
                      <span className="font-mono text-xs text-[#8888aa] truncate pr-2">{p.motivo}</span>
                      <div className="font-mono text-[10px] text-[#3a3a5c]">
                        <div className="text-[#8888aa]">{formatDate(p.dataPunicao)}</div>
                        <div>por {p.aplicadoPor}</div>
                      </div>
                      <div className="flex items-center gap-1 text-[#3a3a5c] group-hover:text-red-400 transition-colors font-mono text-[10px] uppercase tracking-widest">
                        <Eye className="w-3.5 h-3.5" /><span>Ver</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}