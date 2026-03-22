"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Script from 'next/script';

const API_KEY = 'Mo7HJTjnzFp3OvBl'; 
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';
const BETWAY_AFFILIATE_URL = 'https://www.betway.co.za'; 

const POPULAR_LEAGUES = [39, 140, 2, 135, 78];

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  // TYPED MATH ENGINE
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) => (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    const hId = item?.teams?.home?.id || 1;
    const aId = item?.teams?.away?.id || 2;
    const isPopular = POPULAR_LEAGUES.includes(item?.league?.id);
    const homeLambda = ((hId % 10) / 4) + (isPopular ? 1.8 : 1.2);
    const awayLambda = ((aId % 10) / 5) + (isPopular ? 1.4 : 0.8);

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
      // Fetch LIVE matches
      let res = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: { live: 'all' },
        headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      });

      // FALLBACK if empty
      if (!res.data.response || res.data.response.length === 0) {
        res = await axios.get('https://v3.football.api-sports.io/fixtures', {
          params: { next: 20 },
          headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        });
      }
      
      setFixtures(res.data.response || []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLiveData(); }, [fetchLiveData]);

  const getEliteMarket = (market: string, probs: any) => {
    const markets: Record<string, string> = {
      "BTTS": (probs.homeLambda > 1.6 && probs.awayLambda > 1.3) ? "Yes" : "No",
      "Overs_Unders": (probs.homeLambda + probs.awayLambda > 2.6) ? "Over 2.5" : "Under 2.5",
      "Double_Chance": probs.homeProb > probs.awayProb ? "1X" : "X2",
      "Handicap": probs.homeProb > 55 ? "-1.0" : "+1.5",
      "Clean_Sheet": probs.awayLambda < 1.1 ? "Home Yes" : "No",
      "First_Half": probs.homeProb > 42 ? "Home" : "Draw",
    };
    return markets[market] || "PRO";
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 max-w-xl mx-auto pb-32">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" />
      <Script 
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} 
        onLoad={() => console.log("Paypal Loaded")}
      />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8 px-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter uppercase">GoalPro</h1>
          <button 
            onClick={() => !isPaid && setShowPaymentModal(true)} 
            className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Search matches..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500" 
        />
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 animate-pulse">
            <p className="text-blue-500 font-black uppercase text-[10px] tracking-widest">Scanning World Markets...</p>
          </div>
        ) : fixtures.length === 0 ? (
          <div className="text-center py-20 opacity-40 uppercase text-[10px] font-black">No active data found</div>
        ) : (
          fixtures.filter(f => 
            f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((item) => {
            const probs = getPoissonPredictions(item);
            const isPopular = POPULAR_LEAGUES.includes(item.league.id);
            return (
              <div key={item.fixture.id} className={`bg-[#0f172a] rounded-[2.5rem] border ${isPopular ? 'border-blue-500/30' : 'border-slate-800'} p-6 relative`}>
                <div className="flex justify-between text-[9px] font-black text-slate-400 mb-6 uppercase tracking-wider">
                  <span className={isPopular ? 'text-blue-400' : ''}>{item.league.name}</span>
                  <span className="text-blue-400">
                    {item.fixture.status.short === 'NS' 
                      ? new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
                      : item.fixture.status.elapsed + "'"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-8 font-black text-lg text-white uppercase text-center">
                  <span className="flex-1">{item.teams.home.name}</span>
                  <span className="px-4 opacity-10 italic text-xs">VS</span>
                  <span className="flex-1">{item.teams.away.name}</span>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between mb-2 text-[9px] font-black uppercase text-slate-500 px-1">
                    <span>H {probs.homeProb}%</span>
                    <span>D {probs.drawProb}%</span>
                    <span>A {probs.awayProb}%</span>
                  </div>
                  <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-slate-800">
                    <div style={{ width: `${probs.homeProb}%` }} className="bg-blue-500" />
                    <div style={{ width: `${probs.drawProb}%` }} className="bg-slate-600" />
                    <div style={{ width: `${probs.awayProb}%` }} className="bg-emerald-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)} 
                    className="py-4 text-[9px] font-black text-white uppercase bg-blue-600/10 border border-blue-500/20 rounded-2xl"
                  >
                    {selectedMatch === item.fixture.id ? "Close ▲" : "Elite Markets ▼"}
                  </button>
                  <a href={BETWAY_AFFILIATE_URL} target="_blank" rel="noreferrer" className="py-4 text-[9px] font-black text-emerald-400 uppercase bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-center flex items-center justify-center">Betway</a>
                </div>
                {selectedMatch === item.fixture.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-3">
                    {["BTTS", "Overs_Unders", "Double_Chance", "Handicap", "Clean_Sheet", "First_Half"].map((m) => (
                      <div key={m} onClick={() => !isPaid && setShowPaymentModal(true)} className="p-4 rounded-2xl border border-slate-800 bg-black/20 cursor-pointer">
                        <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{m.replace('_', ' ')}</p>
                        <div className="flex justify-between items-center">
                          <p className={`font-black text-xs ${!isPaid ? 'blur-md opacity-20' : 'text-blue-400'}`}>{isPaid ? getEliteMarket(m, probs) : "LOCKED"}</p>
                          {!isPaid && <span className="text-[6px] bg-blue-600 px-2 py-0.5 rounded-full font-black text-white uppercase tracking-tighter">VIP</span>}
                        </div>
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
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[3rem] p-10 w-full max-w-sm text-center">
            <h2 className="text-3xl font-black italic mb-2 uppercase text-white">Unlock VIP</h2>
            <div id="paypal-container" className="my-8 min-h-[150px]"></div>
            <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 text-[10px] font-black uppercase">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
