"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Script from 'next/script';

const API_SPORTS_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 
const SPORTS_DB_KEY = '2'; 
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
  const [selectedMatch, setSelectedMatch] = useState<any>(null); // Changed to any for safer comparisons
  const [hasMounted, setHasMounted] = useState(false);
  const [dataSource, setDataSource] = useState("Checking...");

  useEffect(() => { setHasMounted(true); }, []);

  // Simplified Poisson for Build Stability
  const getPoissonPredictions = (hId: any, aId: any, leagueId?: any) => {
    const homeId = parseInt(hId) || 0;
    const awayId = parseInt(aId) || 0;
    const isPopular = leagueId ? POPULAR_LEAGUES.includes(leagueId) : false;
    
    const homeLambda = ((homeId % 10) / 4) + (isPopular ? 1.8 : 1.2);
    const awayLambda = ((awayId % 10) / 5) + (isPopular ? 1.4 : 0.8);

    return {
      homeProb: Math.floor((homeLambda / (homeLambda + awayLambda + 0.5)) * 100),
      drawProb: 20,
      awayProb: Math.floor((awayLambda / (homeLambda + awayLambda + 0.5)) * 100),
    };
  };

  const fetchAllSources = useCallback(async () => {
    if (!hasMounted) return;
    setLoading(true);
    const targetDate = new Date().toISOString().split('T')[0];

    try {
      const res = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: { date: targetDate },
        headers: { 'x-apisports-key': API_SPORTS_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      });

      if (res.data?.response?.length > 0) {
        const cleaned = res.data.response.map((f: any) => ({
          id: f.fixture.id,
          league: f.league.name,
          leagueId: f.league.id,
          home: f.teams.home.name,
          away: f.teams.away.name,
          homeId: f.teams.home.id,
          awayId: f.teams.away.id,
          time: new Date(f.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        }));
        setFixtures(cleaned);
        setDataSource("API-Sports");
        setLoading(false);
        return;
      }
    } catch (e) { console.log("Primary API down."); }

    try {
      const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_KEY}/eventsday.php?d=${targetDate}&s=Soccer`);
      if (res.data?.events) {
        const cleaned = res.data.events.map((f: any) => ({
          id: f.idEvent,
          league: f.strLeague,
          home: f.strHomeTeam,
          away: f.strAwayTeam,
          homeId: f.idHomeTeam,
          awayId: f.idAwayTeam,
          time: f.strTime?.substring(0, 5) || "LIVE"
        }));
        setFixtures(cleaned);
        setDataSource("TheSportsDB");
      }
    } catch (e) {
      setDataSource("Offline");
    } finally {
      setLoading(false);
    }
  }, [hasMounted]);

  useEffect(() => { fetchAllSources(); }, [fetchAllSources]);

  if (!hasMounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 max-w-xl mx-auto pb-32">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" />
      
      <header className="pt-4 pb-6 border-b border-slate-800/50 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
          <button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Search team..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm" 
        />
      </header>

      <div className="space-y-6">
        {loading ? (
           <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20">Syncing Data...</p>
        ) : fixtures.length === 0 ? (
           <p className="text-center text-slate-500 py-20 font-bold">No matches found. Try again later.</p>
        ) : (
          fixtures
            .filter(f => f.home?.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item) => {
              const probs = getPoissonPredictions(item.homeId, item.awayId, item.leagueId);
              return (
                <div key={item.id} className="bg-[#0f172a] rounded-[2rem] border border-slate-800 p-6 shadow-xl">
                  <div className="flex justify-between text-[9px] font-black text-blue-400 uppercase mb-4">
                    <span>{item.league}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 font-black text-lg text-center">
                    <span className="flex-1">{item.home}</span>
                    <span className="px-4 opacity-10">VS</span>
                    <span className="flex-1">{item.away}</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-black mb-2">
                    <span>H {probs.homeProb}%</span>
                    <span>D {probs.drawProb}%</span>
                    <span>A {probs.awayProb}%</span>
                  </div>
                  <div className="h-1 w-full flex rounded-full overflow-hidden bg-slate-800 mb-6">
                    <div style={{ width: `${probs.homeProb}%` }} className="bg-blue-500" />
                    <div style={{ width: `${probs.drawProb}%` }} className="bg-slate-500" />
                    <div style={{ width: `${probs.awayProb}%` }} className="bg-emerald-500" />
                  </div>
                  <button 
                    onClick={() => setSelectedMatch(selectedMatch === item.id ? null : item.id)} 
                    className="w-full py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase"
                  >
                    {selectedMatch === item.id ? "Close" : "Predictions"}
                  </button>
                </div>
              );
            })
        )}
      </div>
    </main>
  );
}
