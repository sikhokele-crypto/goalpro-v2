"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Script from "next/script";

const API_KEY = "3";
const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";
const PUB_ID = "pub-4608500942276282";
const BETWAY_AFFILIATE_URL = "https://www.betway.co.za";
const CACHE_KEY = "goalpro_fixtures_cache";
const CACHE_TIME = 10 * 60 * 1000; // 10 Minutes in milliseconds

const LEAGUES = [
  { id: 0, name: "ALL" },
  { id: 4328, name: "EPL" },
  { id: 4335, name: "LA LIGA" },
  { id: 4331, name: "BUNDESLIGA" },
  { id: 4332, name: "SERIE A" },
  { id: 4334, name: "LIGUE 1" },
  { id: 4337, name: "EREDIVISIE" },
];

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLeague, setActiveLeague] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // --- MATH ENGINE ---
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) =>
    (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    const hId = item.teams.home.id || 1;
    const aId = item.teams.away.id || 2;
    const homeLambda = (hId % 10) / 4 + 1.5;
    const awayLambda = (aId % 10) / 5 + 1.1;

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
      homeLambda,
      awayLambda,
    };
  };

  const getAutoPick = (probs: any) => {
    const max = Math.max(probs.homeProb, probs.drawProb, probs.awayProb);
    if (probs.homeProb === max) return "HOME WIN";
    if (probs.awayProb === max) return "AWAY WIN";
    return "DRAW / X";
  };

  // --- UI HELPERS ---
  const formatLocalTime = (date: string, time: string) => {
    const d = new Date(date + " " + (time || "00:00:00"));
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDayLabel = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "TODAY";
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return "TOMORROW";
    return d.toLocaleDateString();
  };

  const isLiveMatch = (date: string, time: string) => {
    const now = new Date().getTime();
    const kickoff = new Date(date + " " + (time || "00:00:00")).getTime();
    return now >= kickoff && now <= kickoff + 2 * 60 * 60 * 1000;
  };

  // --- CRASH-PROOF FETCHING WITH CACHE ---
  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    
    // 1. Check Cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached && !force) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setFixtures(data);
        setLastUpdated(timestamp);
        setLoading(false);
        return;
      }
    }

    // 2. If no cache or forced, fetch from API
    try {
      const leagueIds = LEAGUES.filter(l => l.id !== 0).map(l => l.id);
      let allEvents: any[] = [];

      for (const id of leagueIds) {
        try {
          const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsseason.php?id=${id}`);
          if (res.data?.events) allEvents = [...allEvents, ...res.data.events];
          await new Promise(r => setTimeout(r, 250)); // Sequential breathing room
        } catch (e) { console.error("League Error", id); }
      }

      const now = new Date();
      const mapped = allEvents
        .filter(ev => new Date(ev.dateEvent + " " + (ev.strTime || "00:00:00")) >= now)
        .map(ev => ({
          fixture: { id: parseInt(ev.idEvent) },
          league: { id: parseInt(ev.idLeague), name: ev.strLeague },
          time: ev.strTime,
          date: ev.dateEvent,
          teams: {
            home: { id: parseInt(ev.idHomeTeam), name: ev.strHomeTeam },
            away: { id: parseInt(ev.idAwayTeam), name: ev.strAwayTeam }
          }
        }))
        .sort((a, b) => new Date(a.date + " " + (a.time || "00:00:00")).getTime() - new Date(b.date + " " + (b.time || "00:00:00")).getTime());

      // 3. Save to Cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: mapped }));
      setFixtures(mapped);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredFixtures = fixtures.filter(f => {
    const matchesSearch = f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = activeLeague === 0 || f.league.id === activeLeague;
    return matchesSearch && matchesLeague;
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 max-w-xl mx-auto pb-32">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} strategy="afterInteractive" crossOrigin="anonymous" />
      <Script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} strategy="beforeInteractive" />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-4 border-b border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-5 px-1">
          <div>
            <h1 className="text-4xl font-black text-blue-500 italic leading-none">GOALPRO</h1>
            {lastUpdated && (
              <p className="text-[7px] text-slate-500 font-bold tracking-widest mt-1 uppercase">
                Synced {Math.floor((Date.now() - lastUpdated) / 60000)}m ago
              </p>
            )}
          </div>
          <button onClick={() => !isPaid && setShowPaymentModal(true)} className={`px-5 py-2 rounded-2xl text-[10px] font-black transition-all ${isPaid ? "bg-emerald-600" : "bg-blue-600 shadow-lg shadow-blue-500/20"}`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        
        <div className="relative">
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search matches..." className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-sm mb-4 outline-none focus:border-blue-500 transition-colors" />
          {fixtures.length > 0 && !loading && (
             <button onClick={() => fetchData(true)} className="absolute right-4 top-4 text-blue-500 opacity-40 hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11
