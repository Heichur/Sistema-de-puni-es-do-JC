'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { registrarPunicao, getSession, getFichaByNick, generateId } from '@/lib/store';
import { TipoPunicao } from '@/types';
import {
  FilePlus, Upload, Link as LinkIcon, X, Image as ImageIcon,
  Check, User, ChevronRight, Info, AlertTriangle,
} from 'lucide-react';

interface ProvaTemp {
  id: string; tipo: 'upload' | 'link'; file?: File;
  url: string; nome: string; preview?: string;
  uploading?: boolean; erro?: string;
}

const TIPOS: { value: TipoPunicao; label: string; color: string; desc: string }[] = [
  { value: 'mute',           label: 'Mute',      color: 'border-blue-700 bg-blue-950/30 text-blue-400',       desc: 'Silenciamento'       },
  { value: 'ban_temporario', label: 'Ban Temp.', color: 'border-orange-700 bg-orange-950/30 text-orange-400', desc: 'Banimento temporário' },
  { value: 'ban_permanente', label: 'Ban Perm.', color: 'border-red-700 bg-red-950/30 text-red-400',          desc: 'Banimento permanente' },
];

export default function NovaPunicaoPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nickMinecraft, setNickMinecraft] = useState('');
  const [nickDiscord, setNickDiscord]     = useState('');
  const [idDiscord, setIdDiscord]         = useState('');
  const [tipo, setTipo]                   = useState<TipoPunicao>('mute');
  const [motivo, setMotivo]               = useState('');
  const [duracao, setDuracao]             = useState('');
  const [provas, setProvas]               = useState<ProvaTemp[]>([]);
  const [linkInput, setLinkInput]         = useState('');
  const [fichaExistente, setFichaExistente] = useState<null | { nick: string; total: number }>(null);
  const [checkedNick, setCheckedNick]     = useState('');
  const [saving, setSaving]               = useState(false);
  const [erroGeral, setErroGeral]         = useState('');
  const [done, setDone]                   = useState<{ fichaId: string; isNova: boolean } | null>(null);
  const [drag, setDrag]                   = useState(false);
  const [errors, setErrors]               = useState<Record<string, string>>({});

  async function checkNick() {
    if (!nickMinecraft || nickMinecraft === checkedNick) return;
    setCheckedNick(nickMinecraft);
    try {
      const f = await getFichaByNick(nickMinecraft);
      setFichaExistente(f ? { nick: f.nickMinecraft, total: f.punicoes.length } : null);
    } catch { /* ignora erro de rede na verificação */ }
  }

  async function uploadParaCloudinary(prova: ProvaTemp): Promise<string> {
    if (!prova.file) return prova.url;
    setProvas(prev => prev.map(p => p.id === prova.id ? { ...p, uploading: true, erro: undefined } : p));

    const fd = new FormData();
    fd.append('file', prova.file);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();

    if (!res.ok || !data.url) {
      const msg = data.error || 'Falha no upload';
      setProvas(prev => prev.map(p => p.id === prova.id ? { ...p, uploading: false, erro: msg } : p));
      throw new Error(msg);
    }

    setProvas(prev => prev.map(p => p.id === prova.id ? { ...p, uploading: false, url: data.url } : p));
    return data.url;
  }

  function handleFiles(files: FileList | File[]) {
    const novas: ProvaTemp[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: generateId(), tipo: 'upload' as const, file: f,
        url: '', nome: f.name, preview: URL.createObjectURL(f),
      }));
    if (novas.length === 0) return;
    setProvas(p => [...p, ...novas]);
  }

  function addLink() {
    const url = linkInput.trim();
    if (!url) return;
    try { new URL(url); } catch { alert('URL inválida'); return; }
    setProvas(p => [...p, { id: generateId(), tipo: 'link', url, nome: url }]);
    setLinkInput('');
  }

  function removeProva(id: string) {
    setProvas(p => {
      const prova = p.find(x => x.id === id);
      if (prova?.preview) URL.revokeObjectURL(prova.preview);
      return p.filter(x => x.id !== id);
    });
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!nickMinecraft.trim()) e.nick      = 'Nick Minecraft é obrigatório';
    if (!nickDiscord.trim())   e.discord   = 'Nick Discord é obrigatório';
    if (!idDiscord.trim())     e.idDiscord = 'ID Discord é obrigatório';
    if (!motivo.trim())        e.motivo    = 'Motivo é obrigatório';
    if ((tipo === 'mute' || tipo === 'ban_temporario') && !duracao.trim())
      e.duracao = 'Duração é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setErroGeral('');

    try {
      // 1. Upload das imagens
      const provasFinais: Array<{ nome: string; url: string; tipo: 'upload' | 'link' }> = [];
      for (const p of provas) {
        const url = p.tipo === 'upload' ? await uploadParaCloudinary(p) : p.url;
        provasFinais.push({ nome: p.nome, url, tipo: p.tipo });
      }

      // 2. Salvar no Firestore
      const session = getSession();
      if (!session) {
        setErroGeral('Sessão expirada. Faça login novamente.');
        setSaving(false);
        return;
      }

      // duracao é passado como string vazia para ban_permanente;
      // o store.ts converte isso para 'Permanente' automaticamente.
      const { ficha, isNova } = await registrarPunicao(
        { nickMinecraft, nickDiscord, idDiscord, tipo, motivo, duracao, provas: [] },
        provasFinais,
        session
      );
      setDone({ fichaId: ficha.id, isNova });
    } catch (err) {
      console.error('Erro ao registrar punição:', err);
      setErroGeral(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setDone(null); setNickMinecraft(''); setNickDiscord('');
    setIdDiscord(''); setMotivo(''); setDuracao(''); setErroGeral('');
    provas.forEach(p => { if (p.preview) URL.revokeObjectURL(p.preview); });
    setProvas([]); setFichaExistente(null); setCheckedNick('');
  }

  if (done) return (
    <AuthGuard><Navbar />
      <main className="max-w-xl mx-auto px-4 py-16 text-center fade-up">
        <div className="w-14 h-14 border border-green-700 bg-green-950/30 flex items-center justify-center mx-auto mb-5">
          <Check className="w-7 h-7 text-green-400" />
        </div>
        <h2 className="font-['Bebas_Neue'] text-4xl text-white tracking-widest mb-2">PUNIÇÃO REGISTRADA</h2>
        <p className="font-mono text-sm text-[#8888aa] mb-2">
          {done.isNova ? '✦ Nova ficha criada com sucesso.' : '✦ Punição adicionada à ficha existente.'}
        </p>
        <p className="font-mono text-xs text-[#3a3a5c] mb-8">
          Jogador: <span className="text-white">{nickMinecraft}</span>
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push(`/fichas/${done.fichaId}`)}
            className="px-6 py-2.5 bg-red-700 hover:bg-red-600 text-white font-mono text-xs uppercase tracking-widest transition-all">
            Ver Ficha
          </button>
          <button onClick={resetForm}
            className="px-6 py-2.5 border border-[#1a1a2e] text-[#8888aa] hover:text-white font-mono text-xs uppercase tracking-widest transition-all">
            Nova Punição
          </button>
        </div>
      </main>
    </AuthGuard>
  );

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-7 fade-up">
          <div className="flex items-center gap-2 mb-1">
            <FilePlus className="w-4 h-4 text-red-500" />
            <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest">Registro de Punição</span>
          </div>
          <h1 className="font-['Bebas_Neue'] text-5xl text-white tracking-widest">NOVA PUNIÇÃO</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 fade-up">

          {/* Identificação */}
          <section className="bg-[#0d0d18] border border-[#1a1a2e] p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1a1a2e]">
              <User className="w-3.5 h-3.5 text-[#8888aa]" />
              <span className="font-mono text-[10px] text-[#8888aa] uppercase tracking-widest">Identificação do Jogador</span>
            </div>
            <div>
              <label className="label">Nick no Minecraft *</label>
              <input value={nickMinecraft}
                onChange={e => { setNickMinecraft(e.target.value); setFichaExistente(null); setCheckedNick(''); }}
                onBlur={checkNick} placeholder="NickExemplo123"
                className={errors.nick ? 'border-red-700' : ''} />
              {errors.nick && <p className="font-mono text-[10px] text-red-400 mt-1">⚠ {errors.nick}</p>}
              {fichaExistente && (
                <div className="mt-2 flex items-start gap-2 bg-amber-950/20 border border-amber-900/40 px-3 py-2">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] text-amber-400 leading-relaxed">
                    Ficha existente para <strong>{fichaExistente.nick}</strong> ({fichaExistente.total} punição(ões) anterior(es)).
                  </p>
                </div>
              )}
              {checkedNick && !fichaExistente && (
                <div className="mt-2 flex items-center gap-2 bg-green-950/20 border border-green-900/40 px-3 py-2">
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <p className="font-mono text-[10px] text-green-400">Novo jogador — será criada uma ficha nova.</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nick no Discord *</label>
                <input value={nickDiscord} onChange={e => setNickDiscord(e.target.value)}
                  placeholder="usuario#0000" className={errors.discord ? 'border-red-700' : ''} />
                {errors.discord && <p className="font-mono text-[10px] text-red-400 mt-1">⚠ {errors.discord}</p>}
              </div>
              <div>
                <label className="label">ID do Discord *</label>
                <input value={idDiscord} onChange={e => setIdDiscord(e.target.value)}
                  placeholder="123456789012345678" className={errors.idDiscord ? 'border-red-700' : ''} />
                {errors.idDiscord && <p className="font-mono text-[10px] text-red-400 mt-1">⚠ {errors.idDiscord}</p>}
              </div>
            </div>
          </section>

          {/* Tipo */}
          <section className="bg-[#0d0d18] border border-[#1a1a2e] p-5 space-y-4">
            <span className="font-mono text-[10px] text-[#8888aa] uppercase tracking-widest">Tipo de Punição *</span>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {TIPOS.map(t => (
                <button key={t.value} type="button" onClick={() => setTipo(t.value)}
                  className={`flex flex-col items-start p-3 border transition-all ${
                    tipo === t.value ? t.color : 'border-[#1a1a2e] text-[#8888aa] hover:border-[#2a2a4a]'
                  }`}>
                  <span className="font-['Bebas_Neue'] text-xl tracking-widest">{t.label}</span>
                  <span className="font-mono text-[10px] opacity-70">{t.desc}</span>
                </button>
              ))}
            </div>
            {(tipo === 'mute' || tipo === 'ban_temporario') && (
              <div>
                <label className="label">Duração *</label>
                <input value={duracao} onChange={e => setDuracao(e.target.value)}
                  placeholder="Ex: 7 dias, 24 horas"
                  className={errors.duracao ? 'border-red-700' : ''} />
                {errors.duracao && <p className="font-mono text-[10px] text-red-400 mt-1">⚠ {errors.duracao}</p>}
              </div>
            )}
            {/* Indicador visual para ban permanente */}
            {tipo === 'ban_permanente' && (
              <div className="flex items-center gap-2 bg-red-950/20 border border-red-900/40 px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <p className="font-mono text-[10px] text-red-400">Duração: Permanente — sem prazo de expiração.</p>
              </div>
            )}
            <div>
              <label className="label">Motivo *</label>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
                placeholder="Descreva o motivo da punição..."
                className={`resize-y ${errors.motivo ? 'border-red-700' : ''}`} />
              {errors.motivo && <p className="font-mono text-[10px] text-red-400 mt-1">⚠ {errors.motivo}</p>}
            </div>
          </section>

          {/* Provas */}
          <section className="bg-[#0d0d18] border border-[#1a1a2e] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-[#8888aa]" />
              <span className="font-mono text-[10px] text-[#8888aa] uppercase tracking-widest">Provas / Evidências</span>
              <span className="font-mono text-[10px] text-[#3a3a5c]">(opcional)</span>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all ${
                drag ? 'border-red-600 bg-red-950/20' : 'border-[#1a1a2e] hover:border-[#2a2a4a]'
              }`}>
              <Upload className="w-7 h-7 text-[#3a3a5c] mx-auto mb-2" />
              <p className="font-mono text-xs text-[#8888aa]">
                Arraste imagens ou <span className="text-red-400">clique para selecionar</span>
              </p>
              <p className="font-mono text-[10px] text-[#3a3a5c] mt-1">PNG, JPG, WEBP</p>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                onChange={e => e.target.files && handleFiles(e.target.files)} />
            </div>

            <div>
              <label className="label">Ou cole um link externo</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3a3a5c]" />
                  <input value={linkInput} onChange={e => setLinkInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
                    placeholder="https://i.imgur.com/exemplo.png" className="pl-9" />
                </div>
                <button type="button" onClick={addLink}
                  className="px-4 border border-[#1a1a2e] text-[#8888aa] hover:text-white font-mono text-xs uppercase tracking-widest transition-all shrink-0">
                  Adicionar
                </button>
              </div>
            </div>

            {provas.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-[#8888aa] uppercase tracking-widest">
                  {provas.length} prova(s) anexada(s)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {provas.map(p => (
                    <div key={p.id} className="relative border border-[#1a1a2e] bg-[#0a0a0f] overflow-hidden group">
                      {p.tipo === 'upload' ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.preview} alt={p.nome} className="w-full h-24 object-cover" />
                          {p.uploading && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="font-mono text-[10px] text-white">Enviando...</span>
                            </div>
                          )}
                          {p.erro && (
                            <div className="absolute inset-0 bg-red-950/90 flex items-center justify-center p-2">
                              <span className="font-mono text-[10px] text-red-300 text-center">{p.erro}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-24 flex items-center justify-center p-2">
                          <LinkIcon className="w-4 h-4 text-[#3a3a5c] shrink-0 mr-2" />
                          <span className="font-mono text-[10px] text-[#8888aa] truncate">{p.url}</span>
                        </div>
                      )}
                      <button type="button" onClick={() => removeProva(p.id)} disabled={p.uploading}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-900/80 hover:bg-red-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-white" />
                      </button>
                      <div className="px-2 py-1 bg-[#0a0a0f] border-t border-[#1a1a2e]">
                        <p className="font-mono text-[9px] text-[#3a3a5c] truncate">{p.nome}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Erro geral */}
          {erroGeral && (
            <div className="flex items-start gap-2 bg-red-950/30 border border-red-900/50 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="font-mono text-xs text-red-400">{erroGeral}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => router.back()}
              className="px-5 py-2.5 border border-[#1a1a2e] text-[#8888aa] hover:text-white font-mono text-xs uppercase tracking-widest transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-7 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-['Bebas_Neue'] text-xl tracking-widest transition-all glow-red">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-spin" />ENVIANDO</>
                : <>REGISTRAR <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      </main>
    </AuthGuard>
  );
}