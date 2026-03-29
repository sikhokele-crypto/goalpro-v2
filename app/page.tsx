'use client';

import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import LiveTicker from "@/components/LiveTicker";

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      <LiveTicker />

      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-blue-500">GOALPRO</h1>
          <p className="text-xs text-slate-500">AI Betting Intelligence</p>
        </div>

        <button
          onClick={() => setIsVIP(true)}
          className="bg-blue-600 px-5 py-2 rounded-xl font-bold"
        >
          {isVIP ? "VIP ACTIVE" : "UPGRADE"}
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 pb-20">

        {loading && (
          <p className="text-center text-slate-500">Loading matches...</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, i) => (
            <MatchCard key={i} match={match} isVIP={isVIP} />
          ))}
        </div>

      </div>

    </main>
  );
}
