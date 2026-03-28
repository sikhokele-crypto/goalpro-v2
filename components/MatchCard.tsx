{/* Final PayPal.Me Integrated Payment Section */}
{showPayment && (
  <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-[32px] text-center animate-in zoom-in-95 duration-300 shadow-sm">
    <div className="flex flex-col items-center mb-6">
       <div className="w-10 h-1 bg-blue-600 rounded-full mb-3"></div>
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
         Direct PayPal.Me Checkout
       </span>
    </div>
    
    <div className="grid grid-cols-1 gap-3">
      {/* $1 DAILY PASS */}
      <a 
        href="https://www.paypal.com/paypalme/GoalProZA/1USD" 
        target="_blank"
        className="bg-white border border-slate-200 py-4 rounded-2xl text-[11px] font-black text-[#0070ba] flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-slate-50"
      >
        <span className="italic font-extrabold text-sm opacity-90">PayPal</span> 
        DAILY PASS — $1.00
      </a>

      {/* $5 WEEKLY PRO (Highlighted) */}
      <a 
        href="https://www.paypal.com/paypalme/GoalProZA/5USD" 
        target="_blank"
        className="bg-[#0070ba] py-4 rounded-2xl text-[11px] font-black text-white shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-[#005ea6]"
      >
        <span className="italic font-extrabold text-white text-sm">PayPal</span> 
        WEEKLY PRO — $5.00
      </a>

      {/* $10 MONTHLY ELITE */}
      <a 
        href="https://www.paypal.com/paypalme/GoalProZA/10USD" 
        target="_blank"
        className="bg-white border border-slate-200 py-4 rounded-2xl text-[11px] font-black text-[#0070ba] flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-slate-50"
      >
        <span className="italic font-extrabold text-sm opacity-90">PayPal</span> 
        MONTHLY ELITE — $10.00
      </a>
    </div>

    <div className="mt-8 px-4">
      <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed mb-6">
        Click a plan above. After paying, send your receipt to our <span className="text-slate-600">WhatsApp</span> for instant VIP activation.
      </p>
      
      <button 
        onClick={() => setShowPayment(false)} 
        className="text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
      >
        Cancel and Go Back
      </button>
    </div>
  </div>
)}
