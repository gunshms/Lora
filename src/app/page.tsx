"use client";

import Scene from "@/components/canvas/Scene";
import HeroSculpture from "@/components/canvas/HeroSculpture";
import PortfolioGrid from "@/components/ui/PortfolioGrid";
import Services from "@/components/ui/Services";
import Manifesto from "@/components/ui/Manifesto";
import Contact from "@/components/ui/Contact";
import Founders from "@/components/ui/Founders";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import UnicornBackground from "@/components/ui/UnicornBackground";
import LogoMarquee from "@/components/ui/LogoMarquee";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { dict } = useLanguage();

  return (
    <main className="relative z-10 w-full min-h-screen text-text-primary overflow-x-hidden">
      {/* Mobile Fallback Background - Lightweight Gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505] md:hidden" />

      {/* Heavy 3D Elements - Desktop Only */}
      <div className="hidden md:block">
        <UnicornBackground />
      </div>
      <LanguageSwitcher />

      {/* 3D Background - Fixed (Desktop Only) */}
      <div className="hidden md:block">
        <Scene>
          <HeroSculpture />
        </Scene>
      </div>

      {/* Hero Content Overlay */}
      <section className="relative z-10 w-full h-screen flex flex-col justify-center items-center pointer-events-none p-4">
        <div className="flex flex-col items-center mix-blend-difference">
          <h1 className="text-6xl md:text-[10rem] lg:text-[14rem] font-headline uppercase leading-[0.85] tracking-tighter text-center text-primary">
            LORA
            <span className="block text-4xl md:text-8xl lg:text-9xl opacity-80">STUDIO</span>
          </h1>
          <p className="font-body text-xs md:text-sm tracking-[0.3em] md:tracking-[0.5em] text-accent-gold uppercase mt-6 md:mt-12 backdrop-blur-sm bg-black/10 px-4 py-2 rounded-full border border-white/5">
            {dict.hero.triad}
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-pulse">
          <div className="w-[1px] h-12 bg-white/50" />
          <span className="text-[10px] uppercase tracking-widest font-body">{dict.hero.scroll}</span>
        </div>
      </section>

      <LogoMarquee />

      {/* Content Sections */}
      <PortfolioGrid />
      <Services />
      <Founders />
      <Manifesto />
      <Contact />
    </main>
  );
}
