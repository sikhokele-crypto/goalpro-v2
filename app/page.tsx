'use client';

import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import LiveTicker from "@/components/LiveTicker";
import Script from "next/script";

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        // If API returns data, use it. Otherwise, use today's Sunday Bankers.
        if (data && data.length > 0) {
          setMatches(data);
        } else {
          setMatches([
            {
              homeTeam: "Mamelodi Sundowns",
              awayTeam: "Orlando Pirates",
              league: "SA Premiership",
              odds: { home: 1.85, draw: 3.20, away: 4.10 }
            },
            {
              homeTeam: "Man City",
              awayTeam: "Arsenal",
              league: "English Premier League",
              odds: { home: 1.95, draw: 3.50, away: 3.80 }
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans">
      <LiveTicker />

      {/* HEADER - Fixed with Max-Width and Spacing */}
      <div className="max-w-[500px] mx-auto px-6 py-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter">GOALPRO</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">AI Betting Intelligence</p>
        </div>

        <button
          onClick={() => setIsVIP(true)}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all"
        >
          {isVIP ? "VIP ACTIVE" : "UPGRADE"}
        </button>
      </div>

      {/* MATCH FEED */}
      <div className="max-w-[500px] mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Markets...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {matches.map((match, i) => (
              <MatchCard key={i} match={match} isVIP={isVIP} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
