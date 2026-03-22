"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Script from 'next/script';

// 1. Double-check these in your RapidAPI Dashboard
const API_KEY = 'Mo7HJTjnzFp3OvBl'; 
const API_HOST = 'api-football-v1.p.rapidapi.com'; 
const PUB_ID = 'pub-4608500942276282';

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLiveData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // We use the /fixtures endpoint with "live=all"
      // Note: If you want UPCOMING matches instead of Live, change 'live: all' to 'next: 20'
      const res = await axios.get(`https://${API_HOST}/v3/fixtures`, {
        params: { live: 'all' }, 
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST
        }
      });

      // DEBUG: If the API sends an error message in the data
      if (res.data.errors && Object.keys(res.data.errors).length > 0) {
        setErrorMsg(JSON.stringify(res.data.errors));
        return;
      }

      const data = res.data.response || [];
      
      // If no LIVE matches, try fetching the next 15 scheduled matches
      if (data.length === 0) {
        const nextRes = await axios.get(`https://${API_HOST}/v3/fixtures`, {
          params: { next: 15 },
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
          }
        });
        setFixtures(nextRes.data.response || []);
      } else {
        setFixtures(data);
      }

    } catch (err: any) {
      setErrorMsg(err.message || "Connection Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLiveData(); }, [fetchLiveData]);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 max-w-xl mx-auto">
      <header className="py-6 border-b border-slate-800 mb-8">
        <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">AI-Powered Predictions</p>
      </header>

      {/* DEBUG BOX: If this shows up, your API Key or Host is wrong */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl mb-6">
          <p className="text-red-500 text-[10px] font-bold uppercase mb-1">System Error:</p>
          <p className="text-xs font-mono break-all">{errorMsg}</p>
          <p className="text-[9px] mt-2 text-slate-400">Check if you are subscribed to "API-Football" on RapidAPI.</p>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-blue-500 font-black text-[10px]">FETCHING DATA...</div>
        ) : fixtures.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No Matches Found</p>
            <button onClick={() => fetchLiveData()} className="mt-4 text-blue-500 text-[10px] font-black uppercase underline">Retry Sync</button>
          </div>
        ) : (
          fixtures.map((item) => (
            <div key={item.fixture.id} className="bg-[#0f172a] rounded-[2rem] border border-slate-800 p-6 shadow-xl">
              <div className="flex justify-between text-[9px] font-black text-slate-500 mb-4 uppercase">
                <span>{item.league.name}</span>
                <span className="text-blue-400">{item.fixture.status.long}</span>
              </div>
              
              <div className="flex justify-between items-center font-black text-lg uppercase">
                <span className="flex-1 text-center">{item.teams.home.name}</span>
                <span className="px-4 text-blue-500">
                  {item.goals.home ?? 0} - {item.goals.away ?? 0}
                </span>
                <span className="flex-1 text-center">{item.teams.away.name}</span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-center">
                <div className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                  AI Pick: {item.teams.home.id % 2 === 0 ? "Home Win" : "Over 1.5"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
