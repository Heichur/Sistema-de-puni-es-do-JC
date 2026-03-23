import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUD_NAME = 'dazpfzpdj';
const API_KEY    = '183399388127231';
const API_SECRET = 'sNtScJ0wU21KA8AKlGHu56f57iw';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    console.log('[upload] arquivo recebido:', file.name, file.size, 'bytes');

    const timestamp = Math.round(Date.now() / 1000);
    const folder    = 'provas';
    const toSign    = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha256').update(toSign).digest('hex');

    console.log('[upload] assinatura gerada, enviando para Cloudinary...');

    const cloudForm = new FormData();
    cloudForm.append('file', file);
    cloudForm.append('api_key', API_KEY);
    cloudForm.append('timestamp', String(timestamp));
    cloudForm.append('signature', signature);
    cloudForm.append('folder', folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: cloudForm }
    );

    const data = await res.json();
    console.log('[upload] resposta Cloudinary status:', res.status, data);

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? 'Erro no Cloudinary' },
        { status: 500 }
      );
    }

    console.log('[upload] sucesso! URL:', data.secure_url);
    return NextResponse.json({ url: data.secure_url });

  } catch (err) {
    console.error('[upload] erro interno:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}