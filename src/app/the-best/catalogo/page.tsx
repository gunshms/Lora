"use client";

import React, { useState, useMemo } from "react";
import { useAdega } from "@/context/AdegaContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Wine, 
  Beer, 
  Sparkles, 
  Phone, 
  Info,
  Flame,
  Check,
  ShoppingBag
} from "lucide-react";
import Image from "next/image";

export default function CatalogoPublicoPage() {
  const { stock } = useAdega();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"todos" | "cervejas" | "destilados" | "combos" | "outros">("todos");

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Category classifier helper
  const getProductCategory = (name: string): "cervejas" | "destilados" | "combos" | "outros" => {
    const lower = name.toLowerCase();
    
    if (
      lower.includes("cerveja") || 
      lower.includes("heineken") || 
      lower.includes("budweiser") || 
      lower.includes("bud") || 
      lower.includes("amstel") || 
      lower.includes("coron") || 
      lower.includes("skol") || 
      lower.includes("brahma") || 
      lower.includes("original") ||
      lower.includes("stella") ||
      lower.includes("chopp") ||
      lower.includes("imperio") ||
      lower.includes("petropolis")
    ) {
      return "cervejas";
    }

    if (
      lower.includes("absolut") || 
      lower.includes("smirnoff") || 
      lower.includes("whisky") || 
      lower.includes("gin") || 
      lower.includes("vodka") || 
      lower.includes("red label") || 
      lower.includes("ballantines") || 
      lower.includes("passaporte") ||
      lower.includes("chivas") ||
      lower.includes("jack daniels") ||
      lower.includes("corote") ||
      lower.includes("cachaça") ||
      lower.includes("campari") ||
      lower.includes("rum") ||
      lower.includes("tequila") ||
      lower.includes("licor")
    ) {
      return "destilados";
    }

    if (
      lower.includes("combo") || 
      lower.includes("copão") || 
      lower.includes("copao") || 
      lower.includes("kit") ||
      lower.includes("dose")
    ) {
      return "combos";
    }

    return "outros";
  };

  // Filter & Search public products (Only quantity > 0 and price_sell > 0)
  const visibleProducts = useMemo(() => {
    return stock.filter(item => {
      // Must have price and quantity
      if (!item.price_sell || item.price_sell <= 0 || item.quantity <= 0) return false;
      
      // Match search term
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchTerm));
      
      // Match category
      const category = getProductCategory(item.name);
      const matchesCategory = selectedCategory === "todos" || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [stock, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F0E9] pb-24 relative overflow-hidden flex flex-col items-center">
      {/* Decorative Glowing Mesh in background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-radial-gradient from-amber-500/[0.02] to-transparent pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-radial-gradient from-emerald-500/[0.02] to-transparent pointer-events-none rounded-full blur-3xl" />

      {/* Catalog Header with glowing branding */}
      <header className="w-full max-w-lg px-6 pt-10 pb-6 text-center space-y-4">
        <div className="flex justify-center mb-1">
          <div className="relative w-20 h-20 bg-amber-500/5 rounded-full flex items-center justify-center border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <Image 
              src="/adega/crest_white.png" 
              alt="Adega Crest" 
              width={56} 
              height={56} 
              className="object-contain invert opacity-90 animate-pulse"
            />
            <span className="absolute inset-0 rounded-full border border-dashed border-amber-500/25 animate-[spin_50s_linear_infinite]" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400 font-bold uppercase animate-pulse">
            ★ Cardápio Digital Interativo ★
          </span>
          <h1 className="font-headline text-3xl font-black tracking-widest text-white uppercase mt-1">
            THE BEST ADEGA
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-mono tracking-wider uppercase text-emerald-400 font-bold">
              ESTOQUE ATUALIZADO AO VIVO
            </span>
          </div>
        </div>
      </header>

      {/* Sticky Search & Navigation Panel */}
      <div className="w-full max-w-lg px-6 sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md py-4 border-b border-white/5 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar bebida bem gelada..."
            className="w-full pl-10 pr-4 py-3 bg-[#0c0c0e]/95 border border-white/10 rounded-xl focus:border-amber-500/30 focus:outline-none text-white text-xs font-mono placeholder-white/20 uppercase"
          />
        </div>

        {/* Categories Tab Swiper */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin select-none">
          {[
            { id: "todos", label: "Todos", icon: Wine },
            { id: "cervejas", label: "Cervejas", icon: Beer },
            { id: "destilados", label: "Destilados", icon: Flame },
            { id: "combos", label: "Combos/Copões", icon: Sparkles },
            { id: "outros", label: "Outros", icon: ShoppingBag }
          ].map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 font-semibold flex-shrink-0 ${
                  active 
                    ? "bg-amber-400 text-black border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                    : "bg-white/[0.02] border-white/5 text-white/55 hover:text-white/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Public Catalog Cards */}
      <main className="w-full max-w-lg px-6 mt-6 flex-1">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {visibleProducts.map((item) => {
                const isCerveja = getProductCategory(item.name) === "cervejas";
                const isReturnable = !!item.is_returnable;
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#0b0b0d] border border-white/5 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-300"
                  >
                    {/* Glowing side accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                      isCerveja ? "bg-amber-500/30" : "bg-emerald-500/30"
                    }`} />

                    <div className="space-y-2 flex-1 pr-4">
                      <div className="space-y-0.5">
                        <span className="font-headline font-bold text-sm tracking-wide text-white leading-tight uppercase block">
                          {item.name}
                        </span>

                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {/* Returnable Casco indicator */}
                          {isReturnable && (
                            <span className="px-1.5 py-0.2 rounded text-[7px] font-mono font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-400/20">
                              Retornável (Exige casco vazio)
                            </span>
                          )}

                          {/* Low stock indicators */}
                          {item.quantity < 5 ? (
                            <span className="px-1.5 py-0.2 rounded text-[7px] font-mono font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-450/20 animate-pulse">
                              🔥 Poucas Unidades Gelando!
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[7px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                              ✓ Disponível Gelado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Big neon glowing price tag */}
                    <div className="text-right flex-shrink-0">
                      <span className="block text-emerald-400 font-headline font-black text-lg tracking-wide shadow-glow">
                        {formatCurrency(item.price_sell)}
                      </span>
                      {isReturnable && (
                        <span className="text-[8px] font-mono text-white/30 uppercase mt-0.5 block">
                          + {formatCurrency(item.deposit_fee)} dep
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0b0b0d] border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-3">
            <Wine className="w-10 h-10 text-white/10 animate-bounce" />
            <p className="text-xs font-mono uppercase text-white/30 tracking-wider">
              Nenhuma bebida encontrada nesta categoria.
            </p>
          </div>
        )}
      </main>

      {/* Floating order helper bar (Customer facilitator to order directly on WhatsApp) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-40">
        <a 
          href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20estou%20vendo%20o%20card%C3%A1pio%20online%20e%20gostaria%20de%20pedir%20bebidas!" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-headline font-black text-xs tracking-widest rounded-full uppercase transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] duration-300"
        >
          <Phone className="w-4 h-4 fill-black" />
          Fazer Pedido / Entregar WhatsApp
        </a>
      </footer>

      {/* Small informative details box at the end */}
      <div className="w-full max-w-lg px-6 mt-8 text-center text-[8px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
        Adega &amp; Conveniência The Best • Avenida Central, 1234 • Aberto até as 04h
      </div>
    </div>
  );
}
