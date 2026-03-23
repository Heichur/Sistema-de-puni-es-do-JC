import { doc, getDoc } from 'firebase/firestore';
import { getDB1 } from './firebase';
import { AuthSession, Admin } from '@/types';

const SESSION_KEY = 'app_session';
const SESSION_DURATION = 1000 * 60 * 60 * 8; // 8 horas

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function login(
  usuario: string,
  senha: string
): Promise<{ ok: boolean; erro?: string }> {
  try {
    const snap = await getDoc(doc(getDB1(), 'admins', usuario.toLowerCase().trim()));

    if (!snap.exists()) {
      return { ok: false, erro: 'Usuário ou senha incorretos.' };
    }

    const admin = snap.data() as Admin;
    const inputHash = await hashPassword(senha);

    if (inputHash !== admin.senhaHash) {
      return { ok: false, erro: 'Usuário ou senha incorretos.' };
    }

    const session: AuthSession = {
      id: snap.id,
      nome: admin.nome,
      usuario: admin.usuario,
      nivel: admin.nivel,
      avatar: admin.avatar ?? null,
      expiresAt: Date.now() + SESSION_DURATION,
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true };
  } catch (e) {
    console.error('[login]', e);
    return { ok: false, erro: 'Erro ao conectar. Tente novamente.' };
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: AuthSession = JSON.parse(raw);
    if (Date.now() > s.expiresAt) {
      logout();
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAdmin(session: AuthSession | null): boolean {
  return session?.nivel === 'Admin';
}