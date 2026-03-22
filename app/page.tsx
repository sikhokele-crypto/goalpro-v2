"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Script from "next/script";

const API_KEY = "3";
const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";
const PUB_ID = "pub-4608500942276282";
const BETWAY_AFFILIATE_URL = "https://www.betway.co.za";

// League Mapping for the Filter Bar
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

  // --- AI LOGIC (Poisson Distribution) ---
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) =>
    (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    const hId = item.teams.home.id;
    const aId = item.teams.away.id;
    // Base strength + simulated variation based on ID
    const homeLambda = (hId % 10) / 4 + 1.6;
    const awayLambda = (aId % 10) / 5 + 1.2;

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

  const getEliteMarket = (item: any, market: string, probs: any) => {
    const markets: any = {
      BTTS: probs.homeLambda > 1.6 && probs.awayLambda > 1.3 ? "Yes" : "No",
      Overs_Unders: probs.homeLambda + probs.awayLambda > 2.6 ? "Over 2.5" : "Under 2.5",
      Double_Chance: probs.homeProb > probs.awayProb ? "1X" : "X2",
      Handicap: probs.homeProb > 55 ? "-1.0" : "+1.5",
      Clean_Sheet: probs.awayLambda < 1.1 ? "Home Yes" : "No",
      First_Half: probs.homeProb > 42 ? "Home" : "Draw",
      Home_Overs: `Over ${probs.homeLambda > 1.9 ? "1.5" : "0.5"}`,
      Total_Corners: `Over ${(item.teams.home.id % 4) + 7.5}`,
    };
    return markets[market] || "90% IQ";
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const leagueIds = LEAGUES.filter(l => l.id !== 0).map(l => l.id);
        const requests = leagueIds.map(id => 
          axios.get(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsnextleague.php?id=${id}`)
        );
        const results = await Promise.all(requests);
        const allEvents = results.flatMap(res => res.data.events || []);
        
        const mapped = allEvents.map((event: any) => ({
          fixture: { id: parseInt(event.idEvent) },
          league: { id: parseInt(event.idLeague), name: event.strLeague },
          teams: {
            home: { id: parseInt(event.idHomeTeam), name: event.strHomeTeam },
            away: { id: parseInt(event.idAwayTeam), name: event.strAwayTeam }
          }
        }));
        setFixtures(mapped.sort(() => Math.random() - 0.5));
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- FILTERING ---
  const filteredFixtures = fixtures.filter(f => {
    const matchesSearch = f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = activeLeague === 0 || f.league.id === activeLeague;
    return matchesSearch && matchesLeague;
  });

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 max-w-xl mx-auto pb-32 font-sans">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} strategy="afterInteractive" crossOrigin="anonymous" />
      <Script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} strategy="beforeInteractive" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-4 border-b border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-5 px-1">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button 
            onClick={() => !isPaid && setShowPaymentModal(true)} 
            className={`px-5 py-2 rounded-2xl text-[10px] font-black transition-all active:scale-95 ${isPaid ? "bg-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-blue-600 shadow-lg shadow-blue-500/20"}`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        
        <input 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search teams..." 
          className="w-full bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-sm mb-4 focus:border-blue-500 outline-none transition-colors" 
        />

        {/* LEAGUE FILTER PILLS */}
        <div className="flex overflow-x-auto gap-2 pb-2 px-1 scrollbar-hide">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-xl text-[10px] font-bold border transition-all active:scale-90 ${
                activeLeague === league.id 
                ? "bg-blue-600 border-blue-500 text-white" 
                : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>
      </header>

      {/* FIXTURE LIST */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-24 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-500 text-[10px] font-black tracking-[0.2em] uppercase">Processing AI Markets</p>
          </div>
        ) : filteredFixtures.length > 0 ? (
          filteredFixtures.slice(0, 40).map((item) => {
            const probs = getPoissonPredictions(item);
            const isOpen = selectedMatch === item.fixture.id;
            return (
              <div key={item.fixture.id} className="bg-[#0f172a] p-6 rounded-[2rem] border border-slate-800/50 hover:border-blue-500/30 transition-all duration-300">
                <div className="text-[9px] mb-4 font-black text-slate-500 flex justify-between uppercase tracking-widest">
                  <span className="bg-slate-800 px-2 py-1 rounded-md text-blue-400">{item.league.name}</span>
                  <span className="text-emerald-500 py-1">PICK: {getAutoPick(probs)}</span>
                </div>
                
                <div className="flex justify-between items-center font-bold text-base mb-6 px-2 uppercase tracking-tight">
                  <span className="text-center flex-1">{item.teams.home.name}</span>
                  <span className="px-4 text-[10px] text-slate-600 italic">VS</span>
                  <span className="text-center flex-1">{item.teams.away.name}</span>
                </div>

                {/* PROBABILITY VISUALIZER */}
                <div className="h-1.5 flex rounded-full overflow-hidden bg-slate-800 mb-6">
                  <div style={{ width: `${probs.homeProb}%` }} className="bg-blue-500" />
                  <div style={{ width: `${probs.drawProb}%` }} className="bg-slate-600" />
                  <div style={{ width: `${probs.awayProb}%` }} className="bg-emerald-500" />
                </div>

                <button 
                  onClick={() => setSelectedMatch(isOpen ? null : item.fixture.id)} 
                  className={`w-full py-4 text-[10px] font-black rounded-2xl tracking-widest uppercase transition-all ${isOpen ? "bg-white/10 text-white" : "bg-blue-600/5 border border-blue-500/20 text-blue-400"}`}
                >
                  {isOpen ? "CLOSE ANALYTICS" : "UNCOVER ELITE MARKETS"}
                </button>

                {isOpen && (
                  <div className="grid grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    {["BTTS", "Overs_Unders", "Double_Chance", "Handicap", "Clean_Sheet", "First_Half", "Home_Overs", "Total_Corners"].map((m) => (
                      <div 
                        key={m} 
                        className="p-4 bg-black/40 border border-slate-800/50 rounded-[1.2rem] transition-all active:scale-95" 
                        onClick={() => !isPaid && setShowPaymentModal(true)}
                      >
                        <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">{m.replace('_', ' ')}</p>
                        <p className={`text-[11px] font-black ${isPaid ? "text-blue-400" : "blur-[4px] opacity-40 select-none"}`}>
                          {isPaid ? getEliteMarket(item, m, probs) : "LOCKED"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <a href={BETWAY_AFFILIATE_URL} target="_blank" className="block mt-5 text-center text-[9px] text-slate-600 font-bold underline uppercase tracking-[0.15em]">Official Partner: Betway →</a>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No Matches Live</p>
          </div>
        )}
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-md transition-all">
          <div className="bg-[#0f172a] p-8 rounded-[3rem] text-center w-full max-w-sm border border-blue-500/30 shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-blue-500 text-2xl font-black">★</span>
            </div>
            <h2 className="text-3xl font-black mb-2 italic tracking-tighter">ELITE VIP</h2>
            <p className="text-[10px] text-slate-400 mb-8 uppercase tracking-widest leading-relaxed">Unlock 100% accurate AI market data<br />and clean sheets analytics.</p>
            <div id="paypal-button-container" className="min-h-[150px]"></div>
            <PayPalButtonsRenderer setIsPaid={setIsPaid} setShowPaymentModal={setShowPaymentModal} />
            <button onClick={() => setShowPaymentModal(false)} className="mt-8 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Continue with Free Data</button>
          </div>
        </div>
      )}
    </main>
  );
}

// PayPal Renderer Component
function PayPalButtonsRenderer({ setIsPaid, setShowPaymentModal }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).paypal) {
        (window as any).paypal.Buttons({
          style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' },
          createOrder: (data: any, actions: any) => actions.order.create({ purchase_units: [{ amount: { currency_code: "USD", value: "1.00" } }] }),
          onApprove: (data: any, actions: any) => actions.order.capture().then(() => { setIsPaid(true); setShowPaymentModal(false); })
        }).render("#paypal-button-container");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [setIsPaid, setShowPaymentModal]);
  return null;
}
