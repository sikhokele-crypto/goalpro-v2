'use client';

import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isVIP, setIsVIP] = useState(false);

  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(setMatches);
  }, []);

  return (
    <main className="min-h-screen bg-[#0b1220] text-white">

      {/* HEADER */}
      <div className="bg-[#111827] px-6 py-4 flex justify-between items-center border-b border-white/10">
        <h1 className="font-black text-xl text-green-400">GOALPRO AI</h1>

        <button
          onClick={() => setIsVIP(true)}
          className="bg-green-500 px-4 py-2 rounded-lg text-black font-bold"
        >
          {isVIP ? "VIP ACTIVE" : "GO VIP"}
        </button>
      </div>

      {/* MATCH GRID */}
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((m, i) => (
          <MatchCard key={i} match={m} isVIP={isVIP} />
        ))}
      </div>

    </main>
  );
}
