import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Match from '../../../models/Match';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    // Your scraping logic would go here
    return NextResponse.json({ message: "Scrape successful" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
