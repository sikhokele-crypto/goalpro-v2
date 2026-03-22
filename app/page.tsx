"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const API_KEY = '123';
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';
const BETWAY_AFFILIATE_URL = 'https://www.betway.co.za';

export default function GoalPro() {
  // --- STATE ---
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false); // CRITICAL: Fixes Hydration Error
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // --- HYDRATION & PERSISTENCE ---
  useEffect(() => {
    setMounted(true);
    const status = localStorage.getItem('goalpro_vip');
    if (status === 'true') setIsPaid(true);
  }, []);

  // --- MATH LOGIC ---
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) =>
    (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    // Safety check for missing IDs
    const hId = item?.teams?.home?.id || 1;
    const aId = item?.teams?.away?.id || 1;
    
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
      homeLambda,
      awayLambda
    };
  };

  const getEliteMarket = (item: any, market: string, probs: any) => {
    const markets: any = {
      "BTTS": (probs.homeLambda > 1.6 && probs.awayLambda > 1.3) ? "Yes" : "No",
      "Overs_Unders": (probs.homeLambda + probs.awayLambda > 2.6) ? "Over 2.5" : "Under 2.5",
      "Double_Chance": probs.homeProb > probs.awayProb ? "1X" : "X2",
      "Handicap": probs.homeProb > 55 ? "-1.0" : "+1.5",
      "Clean_Sheet": probs.awayLambda < 1.1 ? "Home Yes" : "No",
      "First_Half": probs.homeProb > 42 ? "Home" : "Draw",
      "Home_Overs": `Over ${probs.homeLambda > 1.9 ? '1.5' : '0.5'}`,
      "Total_Corners": `Over ${(item.teams.home.id % 4) + 7.5}`,
    };
    return markets[market] || "N/A";
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php?d=${today}&s=Soccer`);
        
        const events = res.data?.events || [];
        const mapped = events.map((event: any) => ({
          fixture: { id: parseInt(event.idEvent) },
          league: { name: event.strLeague },
          teams: {
            home: { id: parseInt(event.idHomeTeam), name: event.strHomeTeam },
            away: { id: parseInt(event.idAwayTeam), name: event.strAwayTeam }
          }
        }));
        setFixtures(mapped);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (mounted) fetchLiveData();
  }, [mounted]);

  // --- PAYPAL RENDERER ---
  useEffect(() => {
    if (showPaymentModal && mounted && window.paypal) {
      const container = document.getElementById('paypal-button-container');
      if (container && !container.hasChildNodes()) {
        window.paypal.Buttons({
          style: { shape: 'pill', color: 'blue', label: 'pay', height: 45 },
          createOrder: (data: any, actions: any) => actions.order.create({
            purchase_units: [{ amount: { value: "1.00" } }]
          }),
          onApprove: (data: any, actions: any) => actions.order.capture().then(() => {
            setIsPaid(true);
            localStorage.setItem('goalpro_vip', 'true');
            setShowPaymentModal(false);
          })
        }).render('#paypal-button-container');
      }
    }
  }, [showPaymentModal, mounted]);

  // --- AD COMPONENT ---
  const AdSlot = () => (
    <div className="my-8 mx-2 rounded-3xl bg-slate-900/30 border border-slate-800 p-4 min-h-[150px] flex flex-col items-center justify-center text-center">
      <span className="text-[8px] text-slate-700 font-bold tracking-widest mb-4 uppercase">Sponsored Advertisement</span>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client={`ca-${PUB_ID}`}
           data-ad-slot="auto"
           data-ad-format="auto"
           data-full-width-responsive="true" />
    </div>
  );

  // --- PREVENT HYDRATION ERROR ---
  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 max-w-xl mx-auto pb-40">
      <Script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}`} strategy="beforeInteractive" />
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" />
      
      {/* HEADER */}
      <header className="sticky top-0 bg-[#020617]/95 pt-4 pb-6 mb-8 z-30 border-b border-slate-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO.</h1>
          <button 
            onClick={() => !isPaid && setShowPaymentModal(true)}
            className={`${isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-blue-600 text-white'} px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest transition-all`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          placeholder="Search matches..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 rounded-2xl bg-[#0f172a] border border-slate-800 text-sm outline-none focus:border-blue-500"
        />
      </header>

      {/* MATCH LIST */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-20 text-blue-400 animate-pulse font-mono text-xs">ANALYZING FIXTURES...</div>
        ) : (
          fixtures
            .filter(f => f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.league.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item, i) => {
              const probs = getPoissonPredictions(item);
              return (
                <div key={item.fixture.id}>
                  {i % 3 === 0 && i !== 0 && <AdSlot />}
                  <div className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800/60 p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{item.league.name}</span>
                      <span className="text-[9px] font-black text-blue-400 italic">LIVE IQ ENGINE</span>
                    </div>

                    <div className="flex justify-between text-center font-black text-sm mb-6">
                      <div className="flex-1">{item.teams.home.name}</div>
                      <div className="px-3 text-slate-700 italic">VS</div>
                      <div className="flex-1">{item.teams.away.name}</div>
                    </div>

                    {/* Pro Bar */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden mb-3">
                      <div style={{ width: `${probs.homeProb}%` }} className="bg-blue-600 h-full"></div>
                      <div style={{ width: `${probs.drawProb}%` }} className="bg-slate-700 h-full"></div>
                      <div style={{ width: `${probs
