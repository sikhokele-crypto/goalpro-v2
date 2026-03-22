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

  const fetchLiveData = useCallback(async () => {
    try {
      setLoading(true);
      // Try fetching LIVE matches first
      let res = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: { live: 'all' },
        headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      });

      // FALLBACK: If no matches are live, fetch the next 20 scheduled matches
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

  const getEliteMarket = (item: any, market: string, probs: any) => {
    const markets: any = {
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
      <Script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowPaymentModal(true)} className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter shadow-lg`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input type="text" placeholder="Search team or league..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600" />
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-500 font-black uppercase text-[10px] tracking-widest">Syncing Data...</p>
          </div>
        ) : fixtures.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-[3rem]">
            <p className="text-slate-500 font-bold uppercase text-xs">No Matches Scheduled Right Now</p>
          </div>
        ) : (
          fixtures.filter(f => f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.league.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
            const probs = getPoissonPredictions(item);
            const isPopular = POPULAR_LEAGUES.includes(item.league.id);
            return (
              <div key={item.fixture.id} className={`bg-[#0f172a] rounded-[2.5rem] border ${isPopular ? 'border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-slate-800'} p-6 relative overflow-hidden`}>
                <div className="flex justify-between text-[9px] font-black text-slate-400 mb-6 uppercase tracking-wider">
                  <span className={isPopular ? 'text-blue-400' : ''}>{item.league.name}</span>
                  <span className="text-blue-400 font-bold">{item.fixture.status.short === 'NS' ? new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : item.fixture.status.elapsed + "'"}</span>
                </div>
                <div className="flex justify-between items-center mb-8 font-black text-lg text-white uppercase tracking-tight">
