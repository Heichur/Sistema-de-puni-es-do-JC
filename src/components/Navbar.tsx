'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, logout } from '@/lib/store';
import { AuthSession } from '@/types';
import { Shield, Search, FilePlus, BookOpen, LogOut, Menu, X } from 'lucide-react';

const nav = [
  { href: '/dashboard',           label: 'Painel',       icon: Shield   },
  { href: '/fichas/buscar',       label: 'Buscar Ficha', icon: Search   },
  { href: '/fichas/nova-punicao', label: 'Nova Punição', icon: FilePlus },
  { href: '/guia-punicoes',       label: 'Guia',         icon: BookOpen },
];

export default function Navbar() {
  const router = useRouter();
  const path = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { setSession(getSession()); }, []);

  if (!session) return null;

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0f]/96 backdrop-blur border-b border-[#1a1a2e]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-red-800/60 bg-red-950/30 flex items-center justify-center overflow-hidden">
              <img src="/imgs/LogoJc.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="hidden sm:block">
              <div className="font-['Bebas_Neue'] text-white tracking-widest text-base leading-none">PUNIÇÕES DO JC</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center">
            {nav.map(item => {
              const Icon = item.icon;
              const active = path === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1 mx-0.5 font-mono text-[11px] uppercase tracking-widest transition-all ${
                    active ? 'text-red-400 border-b-2 border-red-600 pb-0' : 'text-[#8888aa] hover:text-white'
                  }`}>
                  <Icon className="w-3 h-3" />{item.label}
                </Link>
              );
            })}
          </div>

          {/* Right — avatar Discord */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {session.avatar ? (
                <img src={session.avatar} alt={session.nome}
                  className="w-7 h-7 rounded-full border border-[#1a1a2e]" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-mono text-xs">
                  {session.nome[0].toUpperCase()}
                </div>
              )}
              <span className="font-mono text-xs text-white">{session.nome}</span>
            </div>

            <button onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-900/50 text-red-500 hover:bg-red-950/30 font-mono text-[11px] uppercase tracking-widest transition-all">
              <LogOut className="w-3 h-3" /><span className="hidden sm:block">Sair</span>
            </button>

            <button className="md:hidden text-[#8888aa]" onClick={() => setOpen(o => !o)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        {open && (
          <div className="md:hidden border-t border-[#1a1a2e] bg-[#0d0d18]">
            {nav.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-5 py-3 border-b border-[#1a1a2e] font-mono text-xs uppercase tracking-widest ${
                    path === item.href ? 'text-red-400 bg-red-950/20' : 'text-[#8888aa]'
                  }`}>
                  <Icon className="w-4 h-4" />{item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
      <div className="h-14" />
    </>
  );
}