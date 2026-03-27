import { NextResponse } from 'next/server';
import { scrapeMatches } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await scrapeMatches();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
