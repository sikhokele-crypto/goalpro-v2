"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Script from 'next/script';

// THE SPORTS DB CONFIG (Free key is '3')
const TSDB_API_KEY = '3'; 
const TSDB_BASE_URL = `https://www.thesportsdb.com/api/v1/json/${TSDB_API_KEY}`;
// Keep your existing IDs
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';
const BETWAY_AFFILIATE_URL = 'https://www.betway.co.za'; 

const POPULAR_LEAGUES = [4328, 4335, 4331, 4332, 4334]; // Updated to TSDB IDs for PL, La Liga, etc.

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) => (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    // Map TSDB IDs to numbers for your math
    const hId = parseInt(item.idHomeTeam) || 1;
    const aId = parseInt(item.idAwayTeam) || 2;
    const isPopular = POPULAR_LEAGUES.includes(parseInt(item.idLeague));
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

  const getAutoPick = (probs: any) => {
    const { homeProb, drawProb, awayProb } = probs;
    const max = Math.max(homeProb, drawProb, awayProb);
    if (homeProb === max) return "HOME WIN";
    if (awayProb === max) return "AWAY WIN";
    return "DRAW / X";
  };

  // FETCH FROM THE SPORTS DB
  const fetchLiveData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetching Next 15 Events for the English Premier League (ID 4328) 
      // You can change the ID to fetch different leagues
      const res = await axios.get(`${TSDB_BASE_URL}/eventsnextleague.php?id=4328`);
      
      const allMatches = res.data.events || [];
      setFixtures(allMatches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLiveData(); }, [fetchLiveData]);

  const getEliteMarket = (item: any, market: string, probs: any) => {
    const markets: any = {
      "BTTS": (probs.homeLambda > 1.6 && probs.awayLambda > 1.3) ? "Yes" : "No",
      "Overs_Unders": (probs.homeLambda + probs.awayLambda > 2.6) ? "Over 2.5" : "Under 2.5",
      "Double_Chance": probs.homeProb > probs.awayProb ? "1X" : "X2",
      "Handicap": probs.homeProb > 55 ? "-1.0" : "+1.5",
      "Clean_Sheet": probs.awayLambda < 1.1 ? "Home Yes" : "No",
      "First_Half": probs.homeProb > 42 ? "Home" : "Draw",
      "Home_Overs": `Over ${probs.homeLambda > 1.9 ? '1.5' : '0.5'}`,
      "Total_Corners": `Over ${(parseInt(item.idHomeTeam) % 4) + 7.5}`,
    };
    return markets[market] || "90% IQ";
  };

  const AdSlot = () => {
    useEffect(() => {
      try { // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }, []);
    return (
      <div className="my-6 p-4 bg-blue-900/5 rounded-3xl border border-dashed border-slate-800 text-center">
        <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={`ca-${PUB_ID}`} data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-32">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" strategy="afterInteractive" />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8 px-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowPaymentModal(true)} className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-600/20`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input type="text" placeholder="Search League..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
      </header>

      <div className="space-y-8">
        {loading ? (
            <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20 tracking-widest">Calculating Poisson Probabilities...</p>
        ) : (
          fixtures.filter((f: any) => 
            f.strHomeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.strLeague.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 50).map((item: any, index: number) => {
            const probs = getPoissonPredictions(item);
            const autoPick = getAutoPick(probs);
            const isPopular = POPULAR_LEAGUES.includes(parseInt(item.idLeague));

            return (
              <div key={item.idEvent}>
                {index % 5 === 0 && index !== 0 && <AdSlot />}
                <div className={`bg-[#0f172a] rounded-[2.5rem] border ${isPopular ? 'border-blue-500/40 shadow-blue-500/5' : 'border-slate-800/80'} p-6 shadow-2xl relative overflow-hidden`}>
                  
                  <div className={`absolute top-0 right-10 ${isPopular ? 'bg-yellow-500' : 'bg-blue-600'} px-4 py-1.5 rounded-b-xl shadow-lg`}>
                    <p className={`text-[7px] font-black uppercase tracking-wid
