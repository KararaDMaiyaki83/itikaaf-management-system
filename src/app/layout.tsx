import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'National I’tikāf Portal • Federal Republic of Nigeria • Powered by GetoCore',
  description: 'Unified digital management platform for Masaajid across all 36 Nigerian States + FCT Abuja. Screening, Floor Spot Allocations (Strict No Beds), Payments, and Gate Verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-stone-50 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="no-print bg-stone-950 text-stone-400 py-8 border-t border-stone-800 text-center text-xs">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold text-stone-300">
                Federal Republic of Nigeria Unified National I’tikāf Platform • شبكة مساجد نيجيريا للاعتكاف
              </span>
              <span className="text-stone-600 hidden sm:inline">•</span>
              <span className="text-amber-400 font-mono text-[11px] bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                Floor Spots Only (No Beds)
              </span>
            </div>

            {/* GETOCORE DIGITAL INNOVATION POWERED BADGE */}
            <div className="pt-2 flex flex-col items-center justify-center gap-1.5">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-stone-200 px-3.5 py-1 rounded-full border border-stone-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] text-stone-400">Powered by</span>
                <span className="text-[11px] font-extrabold tracking-wide text-white bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300 bg-clip-text text-transparent">
                  GetoCore Digital Innovation
                </span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Next-Generation Digital Infrastructure for Masaajid, Endowments & Community Governance
              </p>
            </div>

            <p className="text-stone-600 text-[10px] pt-1">
              © 1447 AH / 2026 CE • Powered by GetoCore Digital Innovation • All Rights Reserved
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
