"use client";

import { useAdega } from "@/context/AdegaContext";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Wine, 
  Lightbulb, 
  PlusCircle, 
  ArrowRight,
  TrendingDown,
  User,
  ShoppingBag,
  CalendarDays
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdegaDashboard() {
  const { costs, ideas, stock, fixedCosts, isCloudMode } = useAdega();

  // Calculations
  const totalGeral = costs.reduce((sum, item) => sum + item.amount, 0);
  const totalGu = costs.reduce((sum, item) => sum + (item.buyer === "gu" ? item.amount : 0), 0);
  const totalMelhor = costs.reduce((sum, item) => sum + (item.buyer === "melhor" ? item.amount : 0), 0);

  const totalGuPago = costs.reduce((sum, item) => sum + (item.buyer === "gu" && item.paid ? item.amount : 0), 0);
  const totalMelhorPago = costs.reduce((sum, item) => sum + (item.buyer === "melhor" && item.paid ? item.amount : 0), 0);
  
  const totalGuPendente = costs.reduce((sum, item) => sum + (item.buyer === "gu" && !item.paid ? item.amount : 0), 0);
  const totalMelhorPendente = costs.reduce((sum, item) => sum + (item.buyer === "melhor" && !item.paid ? item.amount : 0), 0);

  // Rateio: Cada um deve pagar metade dos custos do outro que já foram marcados como pagos
  // Ou seja, soma de todos os itens pagos dividida por 2 é a quota de cada um.
  const totalItensPagos = costs.filter(c => c.paid).reduce((sum, c) => sum + c.amount, 0);
  const quotaAcerto = totalItensPagos / 2;
  
  // Quem pagou mais?
  // Se GuPago > MelhorPago: Melhor deve transferir para Gu a diferença para igualar: (GuPago - quotaAcerto) ou (GuPago - MelhorPago) / 2
  const saldoAcerto = Math.abs(totalGuPago - totalMelhorPago) / 2;
  const credor = totalGuPago > totalMelhorPago ? "Gu" : totalMelhorPago > totalGuPago ? "Melhor" : null;

  // Contas Fixas Calculations
  const totalGeralFixed = fixedCosts.reduce((sum, item) => sum + item.amount, 0);
  const totalPagoFixed = fixedCosts.filter(f => f.paidThisMonth).reduce((sum, item) => sum + item.amount, 0);
  const totalPendenteFixed = totalGeralFixed - totalPagoFixed;
  const fixedProgresso = totalGeralFixed > 0 ? Math.round((totalPagoFixed / totalGeralFixed) * 100) : 0;

  // Alerts
  const urgentStock = stock.filter((s) => s.status === "urgent");
  const recentIdeas = ideas.slice(0, 3);
  const recentCosts = costs.slice(0, 3);

  // Formatting Currency Helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as const;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10 py-4"
    >
      {/* Header Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-mono uppercase text-white/40 tracking-[0.2em]">Painel de Controle</span>
          <h2 className="font-headline text-3xl md:text-4xl font-black tracking-widest text-white mt-1 uppercase">
            VISÃO GERAL
          </h2>
        </div>
        
        {/* Decorative Quote */}
        <div className="flex items-center gap-3 bg-white/[0.01] border border-white/5 px-4 py-2.5 rounded-lg max-w-sm">
          <Image 
            src="/adega/crest_white.png" 
            alt="Crest Tiny" 
            width={24} 
            height={24} 
            className="invert opacity-45 flex-shrink-0"
          />
          <p className="text-[10px] font-mono text-white/50 leading-relaxed uppercase tracking-wider">
            "Distribuidora e Conveniência The Best - Desde 1998."
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Cost Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-6 rounded-xl group">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <DollarSign className="w-48 h-48 text-white" />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Total Investido</span>
            <span className="p-1.5 rounded bg-white/[0.03] text-white/80 border border-white/10">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="text-3xl font-headline font-bold text-white tracking-wide">
            {formatCurrency(totalGeral)}
          </h3>
          
          <div className="flex items-center justify-between mt-6 text-[10px] font-mono text-white/30 uppercase border-t border-white/5 pt-4">
            <span>Gu: {formatCurrency(totalGu)}</span>
            <span>Melhor: {formatCurrency(totalMelhor)}</span>
          </div>
        </div>

        {/* Paid & Settlement Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-6 rounded-xl group">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <TrendingUp className="w-48 h-48 text-white" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Balanço de Acerto</span>
            <span className="p-1.5 rounded bg-white/[0.03] text-emerald-400 border border-white/10">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>

          {credor ? (
            <h3 className="text-xl font-headline font-bold text-white tracking-wide flex items-baseline gap-2">
              <span className="text-emerald-400">{credor}</span> recebe <span className="text-white text-2xl">{formatCurrency(saldoAcerto)}</span>
            </h3>
          ) : (
            <h3 className="text-lg font-headline font-bold text-white/60 tracking-wide uppercase">
              Contas 50/50 Equilibradas!
            </h3>
          )}

          <div className="flex items-center justify-between mt-6 text-[10px] font-mono text-white/30 uppercase border-t border-white/5 pt-4">
            <span>Pago Gu: {formatCurrency(totalGuPago)}</span>
            <span>Pago Melhor: {formatCurrency(totalMelhorPago)}</span>
          </div>
        </div>

        {/* Pending Ledger Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-6 rounded-xl group">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <TrendingDown className="w-48 h-48 text-white" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Total Pendente</span>
            <span className="p-1.5 rounded bg-white/[0.03] text-amber-400 border border-white/10">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="text-3xl font-headline font-bold text-white tracking-wide">
            {formatCurrency(totalGuPendente + totalMelhorPendente)}
          </h3>

          <div className="flex items-center justify-between mt-6 text-[10px] font-mono text-white/30 uppercase border-t border-white/5 pt-4">
            <span>Gu: {formatCurrency(totalGuPendente)}</span>
            <span>Melhor: {formatCurrency(totalMelhorPendente)}</span>
          </div>
        </div>

        {/* Contas Fixas Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-6 rounded-xl group">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <CalendarDays className="w-48 h-48 text-white" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Contas Fixas / Mês</span>
            <span className="p-1.5 rounded bg-white/[0.03] text-emerald-400 border border-white/10">
              <CalendarDays className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="text-3xl font-headline font-bold text-white tracking-wide">
            {formatCurrency(totalGeralFixed)}
          </h3>

          <div className="flex items-center justify-between mt-6 text-[10px] font-mono text-white/30 uppercase border-t border-white/5 pt-4">
            <span>Pago: {formatCurrency(totalPagoFixed)} ({fixedProgresso}%)</span>
            <span>Pendente: {formatCurrency(totalPendenteFixed)}</span>
          </div>
        </div>

      </motion.div>

      {/* Grid: Alerts and Recent Items */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Stock alerts & Recent Costs */}
        <div className="space-y-8">
          
          {/* Urgent Stock Card */}
          <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-rose-500" />
                  <h3 className="font-headline font-bold text-md tracking-wider text-white uppercase">Compras Urgentes</h3>
                </div>
                <Link 
                  href="/the-best/estoque" 
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1 font-mono transition-colors"
                >
                  Ver Estoque
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {urgentStock.length > 0 ? (
                <div className="space-y-3">
                  {urgentStock.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-rose-950/10 border border-rose-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <Wine className="w-4 h-4 text-rose-400" />
                        <span className="text-sm font-medium text-white/90">{item.name}</span>
                      </div>
                      <span className="text-xs font-mono px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Qtd: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-white/30 font-mono uppercase bg-white/[0.01] border border-dashed border-white/5 rounded-lg">
                  Nenhum item com compra urgente pendente.
                </div>
              )}
            </div>
          </div>

          {/* Recent Costs Card */}
          <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4.5 h-4.5 text-white/70" />
                <h3 className="font-headline font-bold text-md tracking-wider text-white uppercase">Últimos Lançamentos</h3>
              </div>
              <Link 
                href="/the-best/custos" 
                className="text-xs text-white/40 hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                Ver Livro-Caixa
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentCosts.length > 0 ? (
              <div className="space-y-3">
                {recentCosts.map((c) => (
                  <div 
                    key={c.id} 
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white/90 leading-tight">{c.description}</span>
                      <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">
                        {c.date} • {c.buyer === "gu" ? "Comprador: Gu" : "Comprador: Melhor"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border ${
                        c.paid 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {c.paid ? "Pago" : "Pendente"}
                      </span>
                      <span className="text-sm font-mono font-semibold text-white">
                        {formatCurrency(c.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/30 font-mono uppercase bg-white/[0.01] border border-dashed border-white/5 rounded-lg">
                Nenhum custo lançado no livro-caixa.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Decorative wave banner & Recent Ideas */}
        <div className="space-y-8">
          
          {/* Zen Wave Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0B0B0D] to-[#040405] border border-white/5 rounded-xl p-8 min-h-[220px] flex flex-col justify-end group">
            {/* The White Crest watermark as background */}
            <div className="absolute right-0 bottom-0 w-64 h-64 opacity-5 transform translate-x-8 translate-y-8 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 select-none">
              <Image 
                src="/adega/crest_white.png" 
                alt="Wave Watermark" 
                width={256} 
                height={256} 
                className="object-contain invert"
              />
            </div>
            
            {/* The Text Sticker logo */}
            <div className="mb-4 inline-block transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="px-4 py-2 bg-white text-black font-black font-headline text-lg tracking-widest uppercase border border-black rounded shadow-lg">
                THE BEST ADEGA
              </div>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed max-w-sm uppercase font-mono tracking-wider">
              ESTABELECIDA EM 1998, NOSSA DISTRIBUIDORA FOCA NA EXCELÊNCIA DO ATENDIMENTO, PREÇO JUSTO E EM PROVER AS MELHORES BEBIDAS DE SÃO PAULO.
            </p>
          </div>

          {/* Recent Ideas mural preview */}
          <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="font-headline font-bold text-md tracking-wider text-white uppercase">Mural de Ideias</h3>
              </div>
              <Link 
                href="/the-best/ideias" 
                className="text-xs text-white/40 hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                Ver Mural
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentIdeas.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {recentIdeas.map((idea) => {
                  const borderColors: Record<string, string> = {
                    burgundy: "border-rose-500/20 bg-rose-550/5",
                    gold: "border-amber-500/20 bg-amber-550/5",
                    sage: "border-emerald-500/20 bg-emerald-550/5",
                    terracotta: "border-orange-500/20 bg-orange-550/5",
                    charcoal: "border-white/10 bg-white/5",
                  };
                  return (
                    <div 
                      key={idea.id} 
                      className={`px-4 py-3 rounded-lg border ${borderColors[idea.color] || "border-white/5 bg-white/[0.01]"}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-white/95 leading-snug">{idea.title}</span>
                        <span className="text-[8px] font-mono uppercase tracking-wider text-white/40">
                          {idea.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{idea.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-white/30 font-mono uppercase bg-white/[0.01] border border-dashed border-white/5 rounded-lg">
                Nenhuma ideia anotada no mural.
              </div>
            )}
          </div>

        </div>

      </motion.div>

    </motion.div>
  );
}
