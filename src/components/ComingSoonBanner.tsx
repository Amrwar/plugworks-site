"use client";

import { useState } from "react";

import { marqueeItems } from "@/lib/marquee";

/** The phrases the banner scrolls, and how many copies cover a wide screen. */
const PHRASE = "Website Launching Soon";
const TAGLINE = "Get ready for something electric";
const CLOSER = "Coming Soon";
const REPEATS = 4;

export default function ComingSoonBanner() {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="relative overflow-hidden bg-gradient-to-r from-plug-electric via-plug-glow to-plug-spark">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
        </div>
        
        {/* Marquee content */}
        <div className="relative py-3 px-4">
          <div className="flex items-center justify-center gap-8 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap gap-8">
              {marqueeItems(PHRASE, REPEATS).map((phrase, i) => (
                <div key={i} className="flex items-center gap-8">
                  <span className="flex items-center gap-2 text-plug-black font-display font-bold text-sm tracking-wider uppercase">
                    <svg aria-hidden="true" className="w-4 h-4 animate-spark" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 3L4 14h7v7l9-11h-7V3z" />
                    </svg>
                    {phrase}
                  </span>
                  <span className="text-plug-black/60">•</span>
                  <span className="text-plug-black font-body text-sm">{TAGLINE}</span>
                  <span className="text-plug-black/60">•</span>
                  <span className="flex items-center gap-2 text-plug-black font-display font-bold text-sm tracking-wider uppercase">
                    <svg aria-hidden="true" className="w-4 h-4 animate-spark" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 3L4 14h7v7l9-11h-7V3z" />
                    </svg>
                    {CLOSER}
                  </span>
                  <span className="text-plug-black/60">•</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-plug-black/60 hover:text-plug-black transition-colors"
            aria-label="Close banner"
          >
            <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
