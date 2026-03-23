// Discord OAuth2 Config
export const DISCORD_CLIENT_ID     = '1485373227315368068';
export const DISCORD_CLIENT_SECRET = 'KzSM8b5Hkso6KqxlsMbdvcApgwvGR9pd';
export const DISCORD_REDIRECT_URI  = 'https://punicoesjc.vercel.app/api/auth/discord/callback';

export const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

// Troca o code pelo access token
export async function exchangeCode(code: string): Promise<string | null> {
  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  DISCORD_REDIRECT_URI,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

// Busca o usuário do Discord com o token
export async function getDiscordUser(accessToken: string): Promise<DiscordUser | null> {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// Monta a URL do avatar
export function avatarUrl(user: DiscordUser): string {
  if (!user.avatar) return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

// Nome de exibição
export function displayName(user: DiscordUser): string {
  return user.global_name || user.username;
}
