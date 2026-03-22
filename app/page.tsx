"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Script from 'next/script';

// CONFIGURATION
const API_KEY = 'Mo7HJTjnzFp3OvBl'; // Your RapidAPI Key
const API_HOST = 'api-football-v1.p.rapidapi.com'; // Standard RapidAPI Host
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  // Math Engine
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) => (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    const hId = item?.teams?.home?.id || 0;
    const aId = item?.teams?.away?.id || 0;
    const homeLambda = ((hId % 10) / 4) + 1.2;
    const awayLambda = ((aId % 10) / 5) + 0.8;

    let hWin = 0, draw = 0, aWin = 0;
    for (let h = 0; h < 6; h++) {
      for (let a = 0; a < 6; a++) {
        const prob = poisson(homeLambda, h) * poisson(awayLambda, a);
        if (h > a) hWin += prob;
        else if (h === a) draw += prob;
        else aWin += prob;
      }
    }
    const total = hWin + draw + aWin || 1;
    return {
      homeProb: Math.floor((hWin / total) * 100),
      drawProb: Math.floor((draw / total) * 100),
      awayProb: Math.floor((aWin / total) * 100),
      homeLambda, awayLambda
    };
  };

  const fetchLiveData = useCallback(async () => {
    try {
      setLoading(true);
      
      // SMART CACHE: Check if we have data from the last 30 mins
      const cachedData = localStorage.getItem('goalpro_cache');
      const cacheTime = localStorage.getItem('goalpro_cache_time');
      const now = Date.now();

      if (cachedData && cacheTime && now - parseInt(cacheTime) < 1800000) {
        console.log("Using Cached Data (Request Saved!)");
        setFixtures(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      // If no cache, fetch from RapidAPI
      const res = await axios.get(`https://${API_HOST}/v3/fixtures`, {
        params: { live: 'all' },
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST
        }
      });

      const data = res.data.response || [];
      setFixtures(data);

      // Save to Cache
      localStorage.setItem('goalpro_cache', JSON.stringify(data));
      localStorage.setItem('goalpro_cache_time', now.toString());

    } catch (err) {
      console.error("RapidAPI Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLiveData(); }, [fetchLiveData]);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 max-w-xl mx-auto pb-32">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" />
      
      <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl pt-4 pb-6 border-b border-slate-800/50 mb-8 px-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowPaymentModal(true)} className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-5 py-2 rounded-2xl text-[10px] font-black uppercase`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Filter matches..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" 
        />
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-blue-500 font-black text-[10px] tracking-[0.2em]">CONNECTING TO RAPIDAPI...</div>
        ) : (
          fixtures.filter(f => f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
            const probs = getPoissonPredictions(item);
            return (
              <div key={item.fixture.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 p-6 relative overflow-hidden shadow-2xl">
                <div className="flex justify-between text-[9px] font-black text-slate-500 mb-6 uppercase tracking-widest">
                  <span>{item.league.name}</span>
                  <span className="text-emerald-500">{item.fixture.status.elapsed}&apos; LIVE</span>
                </div>
                <div className="flex justify-between items-center mb-8 font-black text-lg text-white uppercase text-center">
                  <span className="flex-1">{item.teams.home.name}</span>
                  <span className="px-3 text-[20px] text-blue-500">{item.goals.home} - {item.goals.away}</span>
                  <span className="flex-1">{item.teams.away.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)} className="py-4 text-[9px] font-black text-white uppercase bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                    {selectedMatch === item.fixture.id ? "Close ▲" : "AI Analytics ▼"}
                  </button>
                  <button onClick={() => window.open('https://www.betway.co.za', '_blank')} className="py-4 text-[9px] font-black text-emerald-400 uppercase bg-emerald-600/10 border border-emerald-500/20 rounded-2xl">Betway</button>
                </div>
                {selectedMatch === item.fixture.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
                    {["BTTS", "Over 2.5", "Home Win", "Away Win"].map((m) => (
                      <div key={m} className="p-4 rounded-2xl bg-black/20 border border-slate-800">
                        <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{m}</p>
                        <p className={`font-black text-xs ${!isPaid ? 'blur-md' : 'text-blue-400'}`}>
                          {isPaid ? "High Prob" : "LOCK"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[3rem] p-10 w-full max-w-sm text-center">
            <h2 className="text-2xl font-black italic mb-6 text-white uppercase">Go VIP</h2>
            <div id="paypal-container"></div>
            <button onClick={() => setShowPaymentModal(false)} className="mt-6 text-slate-600 text-[10px] font-black uppercase">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}
