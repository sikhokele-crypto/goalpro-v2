export const dynamic = 'force-dynamic';

import React from 'react';
import dbConnect from '@/lib/dbConnect';
import Match from '@/models/Match';
import { 
  Trophy, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  TrendingUp, 
  Zap 
} from 'lucide-react';

// Revalidation time (optional, but good for sports data)
export const revalidate = 60; 

async function getMatches() {
  try {
    await dbConnect();
    // Fetch matches sorted by start time
    const matches = await Match.find({}).sort({ startTime: 1 }).lean();
    return JSON.parse(JSON.stringify(matches));
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export default async function HomePage() {
  const matches = await getMatches();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-indigo-600 py-12 px-6">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              GoalPro <span className="text-indigo-200 text-2xl not-italic font-medium">v2</span>
            </h1>
          </div>
          <p className="text-indigo-100 max-w-xl text-lg font-medium leading-tight">
            Advanced Predictive Analytics for Over 1.5 Goals. 
            Powered by real-time market data.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Live Fixtures</span>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black">{matches.length}</div>
          </div>
          {/* Add more stat cards here as needed */}
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-indigo-500" />
            Top Probability Picks
          </h2>
          <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">
            Updated Live
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center">
            <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500 mb-2">No active matches found</h3>
            <p className="text-slate-600 mb-6">Run the scraper to populate the database with today&apos;s games.</p>
            <a 
              href="/api/scrape" 
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              Run Scraper Now
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matches.map((match: any) => {
              const probability = (match.over15Prob * 100).toFixed(1);
              
              return (
                <div 
                  key={match._id} 
                  className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tighter">
                      <Clock className="w-3 h-3" />
                      {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <span className="text-slate-700">•</span>
                      <span className="text-indigo-400">{match.league}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="flex-1">
                      <div className="text-lg font-bold truncate leading-tight mb-1 group-hover:text-indigo-400 transition-colors">
                        {match.homeTeam}
                      </div>
                      <div className="text-lg font-bold truncate leading-tight">
                        {match.awayTeam}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-black text-indigo-500 tracking-tighter">
                        {probability}%
                      </div>
                      <div className="text-[10px] font-black uppercase text-slate-500">Over 1.5 Prob</div>
                    </div>
                  </div>

                  {/* Probability Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000"
                      style={{ width: `${probability}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-10 text-center text-slate-500 text-sm font-medium">
        &copy; {new Date().getFullYear()} GoalPro-v2 Predictor. Use data responsibly.
      </footer>
    </div>
  );
}
