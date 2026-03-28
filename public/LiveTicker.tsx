'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function LiveTicker() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchLiveScores = async () => {
      try {
        // Using TheSportsDB (Free Tier) to get livescores
        const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/latestsoccer.php`);
        if (res.data && res.data.events) {
          setLiveMatches(res.data.events);
        }
      } catch (err) {
        console.error("Live Score Fetch Error:", err);
      }
    };

    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 60000); // Update every 1 minute
    return () => clearInterval(interval);
  }, []);

  // If no live games are on, we show a "Stay Tuned" message to keep the bar moving
  if (liveMatches.length === 0) {
    return (
      <div className="w-full bg-blue-600 py-2 border-b border-blue-400/30">
        <div className="flex whitespace-nowrap animate-ticker items-center text-[10px] font-black text-white uppercase italic">
          <span className="mx-10">Waiting for Live Kickoffs...</span>
          <span className="mx-10">GoalPro AI analyzing markets...</span>
          <span className="mx-10">Waiting for Live Kickoffs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-blue-600 overflow-hidden py-2 border-b border-blue-400/30">
      <div className="flex whitespace-nowrap animate-ticker items-center">
        {/* We double the array so it loops smoothly */}
        {[...liveMatches, ...liveMatches].map((m, i) => (
          <div key={i} className="flex items-center mx-8 gap-3">
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
              {m.strHomeTeam} 
              <span className="text-blue-200 mx-1.5">{m.intHomeScore || 0} - {m.intAwayScore || 0}</span> 
              {m.strAwayTeam}
            </span>
            <span className="text-[8px] font-bold text-blue-900 bg-white/90 px-1.5 py-0.5 rounded-sm italic">
              {m.strProgress || "LIVE"}
            </span>
            <div className="w-1.5 h-1.5 bg-white/10 rounded-full ml-4" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: flex;
          width: fit-content;
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
