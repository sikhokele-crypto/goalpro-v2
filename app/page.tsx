export const dynamic = 'force-dynamic';

import React from 'react';
import dbConnect from '@/lib/dbConnect';
import Match from '@/models/Match';
import { Trophy, Clock, Zap, AlertCircle } from 'lucide-react';

async function getMatches() {
  try {
    await dbConnect();
    const matches = await Match.find({}).sort({ startTime: 1 }).lean();
    return JSON.parse(JSON.stringify(matches));
  } catch (error) {
    console.error("DB Error:", error);
    return [];
  }
}

export default async function HomePage() {
  const matches = await getMatches();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-yellow-400" />
          <h1 className="text-2xl font-bold italic tracking-tighter uppercase">GoalPro v2</h1>
        </div>
        <p className="text-slate-400">Over 1.5 Goals Prediction Engine</p>
      </header>

      <main className="max-w-4xl mx-auto">
        {matches.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-slate-600" size={48} />
            <h2 className="text-xl font-bold mb-4">No Data in Database</h2>
            <a href="/api/scrape" className="bg-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-500 transition-colors">
              Run Scraper
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match: any) => (
              <div key={match._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-indigo-400 uppercase mb-1">{match.league}</div>
                  <div className="text-lg font-bold">{match.homeTeam} vs {match.awayTeam}</div>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                    <Clock size={14} />
                    {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-500">{(match.over15Prob * 100).toFixed(0)}%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Confidence</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
