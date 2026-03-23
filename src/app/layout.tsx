import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Punições do JC',
  description: 'Gerenciamento interno de fichas e punições',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}