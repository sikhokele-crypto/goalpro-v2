"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Script from 'next/script';

// --- CONFIGURATION ---
const API_SPORTS_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 
const SPORTS_DB_KEY = '2'; // Public test key (Unlimited for soccer)
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
  const [dataSource, setDataSource] = useState("Checking...");

  useEffect(() => { setHasMounted(true); }, []);

  // --- PREDICTION ENGINE ---
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) => (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (hId: number, aId: number, leagueId?: number) => {
    const isPopular = leagueId ? POPULAR_LEAGUES.includes(leagueId) : false;
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

  // --- MULTI-SOURCE FETCH LOGIC ---
  const fetchAllSources = useCallback(async () => {
    setLoading(true);
    const targetDate = new Date().toISOString().split('T')[0];

    // ATTEMPT 1: API-SPORTS
    try {
      const res = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: { date: targetDate },
        headers: { 'x-apisports-key': API_SPORTS_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      });

      if (res.data.response && res.data.response.length > 0) {
        const cleaned = res.data.response.map((f: any) => ({
          id: f.fixture.id,
          league: f.league.name,
          leagueId: f.league.id,
          home: f.teams.home.name,
          away: f.teams.away.name,
          homeId: f.teams.home.id,
          awayId: f.teams.away.id,
          time: new Date(f.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        })).filter((f: any) => f.id);
        
        setFixtures(cleaned);
        setDataSource("API-Sports");
        setLoading(false);
        return;
      }
    } catch (e) { console.log("API-Sports failed or limited."); }

    // ATTEMPT 2: THESPORTSDB (Backup)
    try {
      const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_KEY}/eventsday.php?d=${targetDate}&s=Soccer`);
      if (res.data.events) {
        const cleaned = res.data.events.map((f: any) => ({
          id: f.idEvent,
          league: f.strLeague,
          home: f.strHomeTeam,
          away: f.strAwayTeam,
          homeId: parseInt(f.idHomeTeam) || 1,
          awayId: parseInt(f.idAwayTeam) || 2,
          time: f.strTime ? f.strTime.substring(0,5) : "LIVE"
        }));
        setFixtures(cleaned);
        setDataSource("TheSportsDB (Backup)");
      }
    } catch (e) {
      setDataSource("All sources offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasMounted) fetchAllSources();
  }, [hasMounted, fetchAllSources]);

  if (!hasMounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-32">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
          <div className="flex flex-col items-end">
             <button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase mb-1">
               {isPaid ? "VIP ACTIVE" : "UPGRADE"}
             </button>
             <span className="text-[6px] text-slate-500 uppercase tracking-widest">{dataSource}</span>
          </div>
        </div>
        <input type="text" placeholder="Search team..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none" />
      </header>

      <div className="space-y-6">
        {loading ? (
           <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20">Syncing Global Data...</p>
        ) : fixtures.length === 0 ? (
           <div className="text-center py-20">
             <p className="text-slate-500 font-bold mb-4">No matches found today.</p>
             <button onClick={() => fetchAllSources()} className="text-blue-500 text-[10px] font-black underline uppercase">Refresh Sources</button>
           </div>
        ) : (
          fixtures.filter(f => f.home.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
            const probs = getPoissonPredictions(item.homeId, item.awayId, item.leagueId);
            return (
              <div key={item.id} className="bg-[#0f172a] rounded-[2rem] border border-slate-800 p-6 shadow-xl">
                <div className="flex justify-between text-[9px] font-black
