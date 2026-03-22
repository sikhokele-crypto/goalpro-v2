"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Script from 'next/script';

const API_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 
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
  const [hasMounted, setHasMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { setHasMounted(true); }, []);

  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) => (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    const hId = item.teams.home.id;
    const aId = item.teams.away.id;
    const isPopular = POPULAR_LEAGUES.includes(item.league.id);
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
    const total = hWin + draw + aWin;
    return {
      homeProb: Math.floor((hWin / total) * 100),
      drawProb: Math.floor((draw / total) * 100),
      awayProb: Math.floor((aWin / total) * 100),
      homeLambda, awayLambda
    };
  };

  const fetchLiveData = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setErrorMsg("");
      
      // Calculate date: if retrying, look at tomorrow
      const dateObj = new Date();
      if (isRetry || dateObj.getHours() >= 21) dateObj.setDate(dateObj.getDate() + 1);
      const targetDate = dateObj.toISOString().split('T')[0];
      
      const res = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: { date: targetDate },
        headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      });
      
      const allMatches = res.data.response || [];
      
      if (allMatches.length === 0 && !isRetry) {
        // If today is empty, automatically try tomorrow once
        fetchLiveData(true);
        return;
      }

      const sortedMatches = allMatches.sort((a: any, b: any) => {
        const aPop = POPULAR_LEAGUES.includes(a.league.id) ? 1 : 0;
        const bPop = POPULAR_LEAGUES.includes(b.league.id) ? 1 : 0;
        return bPop - aPop;
      }).filter((f: any) => f.fixture.status.short !== 'FT');

      setFixtures(sortedMatches);
    } catch (err: any) {
      setErrorMsg(err.response?.status === 429 ? "Daily API Limit Reached" : "Connection Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasMounted) fetchLiveData();
  }, [hasMounted, fetchLiveData]);

  const getEliteMarket = (item: any, market: string, probs: any) => {
    const markets: any = {
      "BTTS": (probs.homeLambda > 1.6 && probs.awayLambda > 1.3) ? "Yes" : "No",
      "Overs_Unders": (probs.homeLambda + probs.awayLambda > 2.6) ? "Over 2.5" : "Under 2.5",
      "Total_Corners": `Over ${(item.teams.home.id % 4) + 7.5}`,
      "Double_Chance": probs.homeProb > probs.awayProb ? "1X" : "X2",
      "Handicap": probs.homeProb > 55 ? "-1.0" : "+1.5",
      "Clean_Sheet": probs.awayLambda < 1.1 ? "Home Yes" : "No",
      "First_Half": probs.homeProb > 42 ? "Home" : "Draw",
      "Home_Overs": `Over ${probs.homeLambda > 1.9 ? '1.5' : '0.5'}`
    };
    return markets[market] || "90% IQ";
  };

  if (!hasMounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-32">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" strategy="afterInteractive" />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button onClick={() => fetchLiveData()} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors">
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
        <input type="text" placeholder="Search team or league..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none" />
      </header>

      <div className="space-y-8">
        {loading ? (
           <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20 tracking-widest">Fetching Live Odds...</p>
        ) : errorMsg ? (
           <div className="text-center py-20">
             <p className="text-red-500 font-black uppercase text-xs mb-2">{errorMsg}</p>
             <p className="text-slate-500 text-[10px]">Please try again later or check your API key.</p>
           </div>
        ) : fixtures.length === 0 ? (
           <div className="text-center py-20">
             <p className="text-slate-500 font-bold mb-4">No active matches found for this period.</p>
             <button onClick={() => fetchLiveData(true)} className="text-blue-500 text-[10px] font-black uppercase border border-blue-500/30 px-4 py-2 rounded-full">Try Tomorrow&apos;s Games</button>
           </div>
        ) : (
          fixtures.filter((f: any) => 
            f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 50).map((item: any, index: number) => {
            const probs = getPoissonPredictions(item);
            const isPopular = POPULAR_LEAGUES.includes(item.league.id);

            return (
              <div key={item.fixture.id}>
                <div className={`bg-[#0f172a] rounded-[2.5rem] border ${isPopular ? 'border-blue-500/40' : 'border-slate-800/80'} p-6 shadow-2xl relative overflow-hidden`}>
                   {/* ... Keep your existing card UI here ... */}
                   <div className="flex justify-between items-center mb-6 px-2 font-black text-white uppercase">
                    <span>{item.teams.home.name}</span>
                    <span className="opacity-20 text-[10px]">VS</span>
                    <span>{item.teams.away.name}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                    <span>Win: {probs.homeProb}%</span>
                    <span>Draw: {probs.drawProb}%</span>
                    <span>Away: {probs.awayProb}%</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </main>
  );
}
