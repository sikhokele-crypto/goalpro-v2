'use client';
import { useEffect, useState } from 'react';

export default function LiveTicker() {
  const [text, setText] = useState("Loading live markets...");

  useEffect(() => {
    setText("AI analyzing global betting markets...");
  }, []);

  return (
    <div className="bg-blue-600 py-2 text-center text-xs font-bold uppercase">
      {text}
    </div>
  );
}
