'use client';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { TIPO_COLORS, TIPO_LABELS } from '@/lib/store';

const guia = [
  {
    tipo: 'mute',
    quando: 'Infrações de comunicação ou comportamento inadequado',
    exemplos: ['Desrespeito grave no chat', 'Spam ou flood', 'Discussões/provocações', 'Linguagem ofensiva'],
    limite: 'Duração padrão: 1h a 7 dias conforme gravidade',
  },
  {
    tipo: 'ban_temporario',
    quando: 'Infrações graves ou reincidência',
    exemplos: ['Uso de hacks/cheats', 'Griefing intencional', 'Mute reincidente', 'Abuso de bugs'],
    limite: 'Duração padrão: 1 a 30 dias',
  },
  {
    tipo: 'ban_permanente',
    quando: 'Infrações gravíssimas ou reincidência extrema',
    exemplos: ['Doxxing ou ameaças reais', 'Exploits graves', 'Fraude/golpe entre membros', 'Discriminação ou assédio'],
    limite: 'Permanente — revisão apenas por admin sênior',
  },
];

const atenuantes = [
  'Primeira infração registrada',
  'Colaboração com a investigação',
  'Reparação de danos causados',
  'Bom histórico anterior',
];

const agravantes = [
  'Reincidência',
  'Infração intencional e premeditada',
  'Dano a múltiplos membros',
  'Tentativa de encobrir a infração',
];

export default function GuiaPunicoesPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-7 fade-up">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-[10px] text-amber-500 uppercase tracking-widest">Referência Interna</span>
          </div>
          <h1 className="font-['Bebas_Neue'] text-5xl text-white tracking-widest">GUIA DE PUNIÇÕES</h1>
          <p className="font-mono text-xs text-[#8888aa] mt-2">
            Referência para aplicação consistente de punições. Sempre use o bom senso e consulte superiores em casos complexos.
          </p>
        </div>

        <div className="bg-amber-950/20 border border-amber-900/40 px-4 py-3 mb-6 flex items-start gap-2 fade-up">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="font-mono text-[10px] text-amber-400 leading-relaxed">
            Este guia é uma referência base. Contexto e reincidência podem alterar a punição aplicada.
            Bans permanentes devem ser aprovados por um admin ou supervisor.
          </p>
        </div>

        <div className="space-y-4 mb-6 fade-up">
          {guia.map(g => (
            <div key={g.tipo} className="bg-[#0d0d18] border border-[#1a1a2e]">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a1a2e]">
                <span className={`badge ${TIPO_COLORS[g.tipo]}`}>{TIPO_LABELS[g.tipo]}</span>
                <span className="font-mono text-xs text-[#8888aa]">{g.quando}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#1a1a2e]">
                <div className="px-5 py-4">
                  <div className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-2">Exemplos de infração</div>
                  <ul className="space-y-1">
                    {g.exemplos.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 font-mono text-xs text-[#8888aa]">
                        <span className="text-[#3a3a5c] shrink-0">→</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-5 py-4">
                  <div className="font-mono text-[10px] text-[#3a3a5c] uppercase tracking-widest mb-2">Observação</div>
                  <p className="font-mono text-xs text-[#8888aa]">{g.limite}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 fade-up">
          <div className="bg-[#0d0d18] border border-red-900/30">
            <div className="px-5 py-4 border-b border-[#1a1a2e] flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="font-['Bebas_Neue'] text-lg text-white tracking-widest">AGRAVANTES</span>
            </div>
            <ul className="divide-y divide-[#1a1a2e]">
              {agravantes.map((a, i) => (
                <li key={i} className="px-5 py-3 font-mono text-xs text-[#8888aa] hover:text-white hover:bg-[#13131f] transition-colors">
                  ↑ {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#0d0d18] border border-green-900/30">
            <div className="px-5 py-4 border-b border-[#1a1a2e] flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="font-['Bebas_Neue'] text-lg text-white tracking-widest">ATENUANTES</span>
            </div>
            <ul className="divide-y divide-[#1a1a2e]">
              {atenuantes.map((a, i) => (
                <li key={i} className="px-5 py-3 font-mono text-xs text-[#8888aa] hover:text-white hover:bg-[#13131f] transition-colors">
                  ↓ {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}