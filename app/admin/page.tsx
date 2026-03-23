"use client";
import { useState } from "react";

export default function AdminPanel() {
  const [msg, setMsg] = useState("");

  const sendGlobalAlert = async () => {
    // This calls a server action to push to all 100k users
    alert("Sending Alert: " + msg);
  };

  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-yellow-500">GoalPro Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 text-sm">Total Users</p>
          <p className="text-4xl font-black">12,402</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 text-sm">Active VIPs</p>
          <p className="text-4xl font-black text-green-500">1,105</p>
        </div>
      </div>

      <section className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Live Match Controller</h2>
        {/* List of 150+ games with "Edit" buttons */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-black rounded-xl">
            <span>Arsenal vs Liverpool</span>
            <button className="bg-yellow-500 text-black px-4 py-1 rounded-lg font-bold text-xs">MANUAL OVERRIDE</button>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">Push Notification (100k Users)</h2>
        <input 
          onChange={(e) => setMsg(e.target.value)}
          className="w-full bg-zinc-800 p-4 rounded-xl mb-4" 
          placeholder="e.g. LATE GOAL ALERT: Chelsea game safe for Over 0.5!"
        />
        <button onClick={sendGlobalAlert} className="w-full bg-blue-600 py-4 rounded-xl font-bold">SEND TO ALL DEVICES</button>
      </section>
    </div>
  );
}
