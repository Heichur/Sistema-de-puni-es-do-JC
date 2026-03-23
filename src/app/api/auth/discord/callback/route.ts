import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, getDiscordUser, displayName } from '@/lib/discord';

const BASE_URL = 'https://punicoesjc.vercel.app';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  // Usuário negou acesso
  if (error || !code) {
    return NextResponse.redirect(`${BASE_URL}/login?erro=acesso_negado`);
  }

  // Troca code por token
  const accessToken = await exchangeCode(code);
  if (!accessToken) {
    return NextResponse.redirect(`${BASE_URL}/login?erro=token_invalido`);
  }

  // Busca dados do usuário
  const discordUser = await getDiscordUser(accessToken);
  if (!discordUser) {
    return NextResponse.redirect(`${BASE_URL}/login?erro=usuario_invalido`);
  }

  // Monta sessão
  const session = {
    adminId:   discordUser.id,
    nome:      displayName(discordUser),
    usuario:   discordUser.username,
    nivel:     'operador',
    avatar:    discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  };

  // Redireciona para o dashboard passando a sessão via cookie
  const response = NextResponse.redirect(`${BASE_URL}/dashboard`);
  response.cookies.set('discord_session', JSON.stringify(session), {
    httpOnly: false, // precisa ser acessível pelo client
    maxAge: 60 * 60 * 8,
    path: '/',
  });
  return response;
}