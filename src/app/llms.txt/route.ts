import { GET as getLlmsText } from '@/app/api/llms/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const GET = getLlmsText;
