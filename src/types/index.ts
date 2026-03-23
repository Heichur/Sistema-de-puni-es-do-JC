export type TipoPunicao = 'mute' | 'ban_temporario' | 'ban_permanente';

export interface Punicao {
  id: string;
  nickMinecraft: string;
  nickDiscord: string;
  idDiscord: string;
  tipo: TipoPunicao;
  motivo: string;
  duracao?: string;
  aplicadoPor: string;
  dataPunicao: string;
  provas: Prova[];
}

export interface FichaCriminal {
  id: string;
  nickMinecraft: string;
  nickDiscord: string;
  idDiscord: string;
  punicoes: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface Prova {
  id: string;
  punicaoId: string;
  tipo: 'upload' | 'link';
  url: string;
  nome: string;
}

export interface AuthSession {
  adminId: string;
  nome: string;
  usuario: string;
  nivel: string;
  avatar?: string | null;
  expiresAt: number;
}