"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const API_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';

// BACKUP DATA: Shows if API is down or empty
const BACKUP_GAMES = [
  { fixture: { id: 101, status: { elapsed: 12 } }, league: { name: "Premier League" }, teams: { home: { name: "Man City" }, away: { name: "Arsenal" } } },
  { fixture: { id: 102, status: { elapsed: 44 } }, league: { name: "La Liga" }, teams: { home: { name: "Real Madrid" }, away: { name: "Barcelona" } } },
  { fixture: { id: 103, status: { elapsed: 78 } }, league: { name: "PSL" }, teams: { home: { name: "Kaizer Chiefs" }, away: { name: "Orlando Pirates" } } }
];

export default function GoalPro() {
  const [fixtures, setFixtures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setLoading(true);
        // Try fetching live matches first
        const res = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
          headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        });

        if (res.data.response && res.data.response.length > 0) {
          setFixtures(res.data.response);
        } else {
          // If API returns nothing, use Backup Games for testing
          setFixtures(BACKUP_GAMES);
        }
      } catch (err) {
        setFixtures(BACKUP_GAMES);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, []);

  const filteredFixtures = fixtures.filter(f => 
    f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-24">
      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-xl pt-4 pb-6 border-b border-white/5 mb-8">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter uppercase">GoalPro</h1>
          <button 
            onClick={() => !isPaid && setShowPaymentModal(true)} 
            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase transition-all ${isPaid ? 'bg-emerald-500' : 'bg-blue-600 shadow-lg shadow-blue-600/20'}`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text"
          placeholder="Search Live Markets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none"
        />
      </header>

      <div className="space-y-6">
        {loading ? (
           <p className="text-center py-20 text-[10px] font-black text-blue-500 animate-pulse uppercase tracking-widest">Warming Up IQ Engine...</p>
        ) : (
          filteredFixtures.map((item) => (
            <div key={item.fixture.id} className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-6 shadow-2xl">
              <div className="flex justify-between text-[9px] font-black text-slate-500 mb-6 uppercase">
                <span>{item.league.name}</span>
                <span className="text-blue-500">{item.fixture.status.elapsed}' Live</span>
              </div>
              <div className="flex justify-between items-center mb-8 font-black text-lg uppercase">
                <span className="flex-1 text-center">{item.teams.home.name}</span>
                <span className="px-4 opacity-10 text-[10px]">VS</span>
                <span className="flex-1 text-center">{item.teams.away.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)} className="py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase">
                  {selectedMatch === item.fixture.id ? "Hide IQ" : "Show IQ"}
                </button>
                <Link href="https://www.betway.co.za" target="_blank" className="py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center border border-emerald-500/20">Betway</Link>
              </div>
              {selectedMatch === item.fixture.id && (
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                   {['BTTS IQ', 'OVER 2.5', '1X2 SAFE', 'CORNERS'].map(market => (
                     <div key={market} onClick={() => !isPaid && setShowPaymentModal(true)} className="p-4 bg-black/20 rounded-2xl border border-white/5 cursor-pointer">
                        <p className="text-[8px] text-slate-500 font-black mb-1">{market}</p>
                        <p className={`text-xs font-black ${isPaid ? 'text-blue-400' : 'blur-sm opacity-30'}`}>{isPaid ? "WINNER" : "LOCKED"}</p>
                     </div>
                   ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <footer className="mt-20 py-10 border-t border-white/5 text-center">
        <div className="flex justify-center gap-6 text-[10px] font-black text-blue-500 uppercase italic mb-8">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/guide">Betting Guide</Link>
          <Link href="/contact">Support</Link>
        </div>
        <p className="text-[8px] text-slate-700 uppercase tracking-[0.4em] font-bold">GoalPro Global V2.0</p>
      </footer>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 w-full max-w-sm text-center">
            <h2 className="text-3xl font-black uppercase italic text-white mb-2 tracking-tighter">Unlock VIP</h2>
            <div id="paypal-container" className="min-h-[150px] mt-8">
              <Script 
                src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}`} 
                onLoad={() => {
                  // @ts-ignore
                  if (window.paypal) {
                    window.paypal.Buttons({
                      style: { layout: 'vertical', color: 'blue', shape: 'pill' },
                      createOrder: (data, actions) => actions.order.create({
                        purchase_units: [{ amount: { currency_code: "USD", value: "1.00" } }]
                      }),
                      onApprove: (data, actions) => actions.order.capture().then(() => {
                        setIsPaid(true); setShowPaymentModal(false);
                      })
                    }).render('#paypal-container');
                  }
                }}
              />
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="mt-6 text-slate-500 text-[10px] font-black uppercase">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}
