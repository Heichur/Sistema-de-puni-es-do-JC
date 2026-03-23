import {
  collection, doc, getDoc, getDocs, setDoc,
  query, where, deleteDoc,
} from 'firebase/firestore';
import { getDB1, getDB2 } from './firebase';
import { FichaCriminal, Punicao, Prova, AuthSession } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Session via cookie (Discord OAuth)
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const match = document.cookie.split('; ').find(r => r.startsWith('discord_session='));
    if (!match) return null;
    const raw = decodeURIComponent(match.split('=').slice(1).join('='));
    const s: AuthSession = JSON.parse(raw);
    if (Date.now() > s.expiresAt) { logout(); return null; }
    return s;
  } catch { return null; }
}

export function logout() {
  if (typeof window === 'undefined') return;
  document.cookie = 'discord_session=; Max-Age=0; path=/';
}

// Fichas
export async function getFichas(): Promise<FichaCriminal[]> {
  console.log('[getFichas] buscando todas as fichas...');
  const snap = await getDocs(collection(getDB1(), 'fichas'));
  console.log('[getFichas] total encontrado:', snap.docs.length);
  snap.docs.forEach(d => console.log('[getFichas] ficha:', d.id, d.data()));
  return snap.docs.map(d => d.data() as FichaCriminal);
}

export async function getFichaById(id: string): Promise<FichaCriminal | null> {
  const snap = await getDoc(doc(getDB1(), 'fichas', id));
  return snap.exists() ? (snap.data() as FichaCriminal) : null;
}

export async function getFichaByNick(nick: string): Promise<FichaCriminal | null> {
  const snap = await getDocs(
    query(collection(getDB1(), 'fichas'), where('nickMinecraft', '==', nick))
  );
  return snap.empty ? null : (snap.docs[0].data() as FichaCriminal);
}

export async function searchFichas(q: string): Promise<FichaCriminal[]> {
  console.log('[searchFichas] buscando por:', q);
  const all = await getFichas();
  console.log('[searchFichas] total de fichas no DB:', all.length);
  const ql = q.toLowerCase();
  const filtered = all.filter(f =>
    f.nickMinecraft.toLowerCase().includes(ql) ||
    f.nickDiscord.toLowerCase().includes(ql) ||
    f.idDiscord.includes(ql)
  );
  console.log('[searchFichas] resultados filtrados:', filtered.length);
  return filtered;
}

async function saveFichaRaw(ficha: FichaCriminal) {
  await setDoc(doc(getDB1(), 'fichas', ficha.id), ficha);
}

// Punições
export async function getPunicoes(): Promise<Punicao[]> {
  const snap = await getDocs(collection(getDB1(), 'punicoes'));
  return snap.docs.map(d => d.data() as Punicao);
}

export async function getPunicaoById(id: string): Promise<Punicao | null> {
  const snap = await getDoc(doc(getDB1(), 'punicoes', id));
  return snap.exists() ? (snap.data() as Punicao) : null;
}

export async function getPunicoesByFicha(fichaId: string): Promise<Punicao[]> {
  const ficha = await getFichaById(fichaId);
  if (!ficha || !ficha.punicoes.length) return [];
  const all = await getPunicoes();
  return ficha.punicoes
    .map(id => all.find(p => p.id === id))
    .filter(Boolean) as Punicao[];
}

// Registrar punição
export async function registrarPunicao(
  dados: Omit<Punicao, 'id' | 'aplicadoPor' | 'dataPunicao'>,
  provasInput: Array<{ nome: string; url: string; tipo: 'upload' | 'link' }>,
  session: AuthSession
): Promise<{ ficha: FichaCriminal; punicao: Punicao; isNova: boolean }> {
  console.log('[1] registrarPunicao iniciando...', { dados, session });

  const punicaoId = generateId();
  console.log('[2] ID gerado:', punicaoId);

  const provas: Prova[] = [];
  for (const p of provasInput) {
    const prova: Prova = { id: generateId(), punicaoId, tipo: p.tipo, url: p.url, nome: p.nome };
    console.log('[3] salvando prova no DB2:', prova.id);
    await setDoc(doc(getDB2(), 'provas', prova.id), prova);
    provas.push(prova);
  }
  console.log('[4] provas salvas:', provas.length);

  const duracaoFinal = dados.duracao?.trim() || 'Permanente';
  console.log('[5] duração final:', duracaoFinal);

  const punicao: Punicao = {
    ...dados,
    duracao: duracaoFinal,
    id: punicaoId,
    aplicadoPor: session.nome,
    dataPunicao: new Date().toISOString(),
    provas,
  };

  console.log('[6] objeto punição:', JSON.stringify(punicao));
  console.log('[7] chamando setDoc punicoes/', punicaoId);
  await setDoc(doc(getDB1(), 'punicoes', punicaoId), punicao);
  console.log('[8] punição salva no Firestore!');

  console.log('[9] buscando ficha por nick:', dados.nickMinecraft);
  let ficha = await getFichaByNick(dados.nickMinecraft);
  const isNova = !ficha;
  console.log('[10] ficha existente?', !isNova);

  if (!ficha) {
    ficha = {
      id: generateId(),
      nickMinecraft: dados.nickMinecraft,
      nickDiscord: dados.nickDiscord,
      idDiscord: dados.idDiscord,
      punicoes: [punicaoId],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
  } else {
    ficha = {
      ...ficha,
      nickDiscord: dados.nickDiscord,
      idDiscord: dados.idDiscord,
      punicoes: [...ficha.punicoes, punicaoId],
      atualizadoEm: new Date().toISOString(),
    };
  }

  console.log('[11] salvando ficha:', ficha.id);
  await saveFichaRaw(ficha);
  console.log('[12] concluído com sucesso!');

  return { ficha, punicao, isNova };
}

// Deletar ficha
export async function deletarFicha(fichaId: string): Promise<void> {
  const ficha = await getFichaById(fichaId);
  if (!ficha) return;

  for (const punicaoId of ficha.punicoes) {
    const provasSnap = await getDocs(
      query(collection(getDB2(), 'provas'), where('punicaoId', '==', punicaoId))
    );
    for (const d of provasSnap.docs) {
      await deleteDoc(doc(getDB2(), 'provas', d.id));
    }
    await deleteDoc(doc(getDB1(), 'punicoes', punicaoId));
  }

  await deleteDoc(doc(getDB1(), 'fichas', fichaId));
}

// Provas
export async function getProvasByPunicao(punicaoId: string): Promise<Prova[]> {
  const snap = await getDocs(
    query(collection(getDB2(), 'provas'), where('punicaoId', '==', punicaoId))
  );
  return snap.docs.map(d => d.data() as Prova);
}

// Utils
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const TIPO_LABELS: Record<string, string> = {
  mute:           'Mute',
  ban_temporario: 'Ban Temp.',
  ban_permanente: 'Ban Permanente',
};

export const TIPO_COLORS: Record<string, string> = {
  mute:           'text-blue-400   bg-blue-950/30   border-blue-800/40',
  ban_temporario: 'text-orange-400 bg-orange-950/30 border-orange-800/40',
  ban_permanente: 'text-red-400    bg-red-950/30    border-red-800/40',
};