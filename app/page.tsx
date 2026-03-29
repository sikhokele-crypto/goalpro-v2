'use client';
import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import LiveTicker from "@/components/LiveTicker";

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setMatches(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <LiveTicker />
      
      {/* Fixed Header Layout */}
      <div className="max-w-[500px] mx-auto px-6 pt-12 pb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter leading-none">GOALPRO</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">v2.0 AI Engine</p>
        </div>
        <button 
          onClick={() => setIsVIP(true)}
          className="bg-blue-600 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:translate-y-0.5 transition-all"
        >
          {isVIP ? "VIP ACTIVE" : "UPGRADE"}
        </button>
      </div>

      <div className="max-w-[500px] mx-auto px-6 pb-20">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-blue-500 font-black text-xs uppercase tracking-widest">
            Fetching Live Sunday Markets...
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
