"use client";

import { useReveal } from "@/hooks/useReveal";


import { LOCATIONS } from "@/data/locations";
import { scatterDots } from "@/lib/scatter";

/**
 * The map dots behind the section.
 *
 * Built once at module scope: the field never changes, so there is no reason
 * to rebuild it on every render.
 */
const MAP_DOTS = scatterDots({ count: 50, width: 1440, height: 600 });

export default function Locations() {
  const { ref: sectionRef, isVisible } = useReveal<HTMLElement>(0.2);

  return (
    <section
      ref={sectionRef}
      id="locations"
      aria-labelledby="locations-heading"
      className="relative py-32 overflow-hidden bg-plug-dark"
    >
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        {/* Map-like dots pattern */}
        <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1440 600">
          {MAP_DOTS.map((dot, index) => (
            <circle
              key={index}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill="#00E5FF"
              className="animate-pulse-slow"
              style={{ animationDelay: `${dot.delay}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block font-display text-sm text-plug-electric uppercase tracking-[0.3em] mb-4">
            Where We Are
          </span>
          <h2
 id="locations-heading"
 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-plug-light mb-6">
            Plugged In
            <span className="gradient-text"> Globally</span>
          </h2>
          <p className="max-w-2xl mx-auto font-body text-lg text-plug-light/60">
            With creative hubs in Egypt and the UAE, we&apos;re strategically positioned 
            to deliver exceptional experiences across the MENA region and beyond.
          </p>
        </div>

        {/* Locations cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {LOCATIONS.map((location, index) => (
            <div
              key={location.country}
              className={`group relative transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="relative p-10 bg-plug-black/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                {/* Accent gradient */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${location.accent}/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700`} />
                
                {/* Content */}
                <div className="relative">
                  {/* Flag and location */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <span className="text-6xl mb-4 block">{location.flag}</span>
                      <h3 className="font-display font-bold text-3xl text-plug-light">
                        {location.country}
                      </h3>
                      <p className={`font-body text-${location.accent} text-lg`}>
                        {location.city}
                      </p>
                    </div>
                    
                    {/* Connection indicator */}
                    <div className="relative">
                      <div className={`w-4 h-4 bg-${location.accent} rounded-full pulse-ring`} />
                    </div>
                  </div>

                  <p className="font-body text-plug-light/60 text-lg leading-relaxed mb-8">
                    {location.description}
                  </p>

                  {/* Connection line to other location */}
                  <div className="flex items-center gap-3 text-plug-light/40">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M13 3L4 14h7v7l9-11h-7V3z" />
                    </svg>
                    <span className="font-body text-sm">Connected</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connection visual between cards */}
        <div className={`hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <svg aria-hidden="true" className="w-32 h-32" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#00E5FF" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#connectionGradient)" strokeWidth="2" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: '20s' }} />
            <circle cx="50" cy="50" r="25" fill="none" stroke="url(#connectionGradient)" strokeWidth="1" strokeDasharray="2 2" className="animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            <circle cx="50" cy="50" r="8" fill="url(#connectionGradient)" className="animate-pulse-slow" />
          </svg>
        </div>
      </div>
    </section>
  );
}
