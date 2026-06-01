"use client";

import React, { useMemo } from "react";
import { useAdega, SaleItem } from "@/context/AdegaContext";
import { motion } from "framer-motion";
import { 
  Receipt, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Trash2, 
  Wine, 
  CalendarDays,
  Percent,
  Calendar
} from "lucide-react";

export default function VendasPage() {
  const { sales, deleteSale } = useAdega();

  // Calculations
  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  }, [sales]);

  const totalProfit = useMemo(() => {
    return sales.reduce((sum, sale) => sum + sale.profit, 0);
  }, [sales]);

  const averageTicket = useMemo(() => {
    if (sales.length === 0) return 0;
    return totalRevenue / sales.length;
  }, [sales, totalRevenue]);

  const averageMargin = useMemo(() => {
    if (totalRevenue === 0) return 0;
    return (totalProfit / totalRevenue) * 100;
  }, [sales, totalRevenue, totalProfit]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!counts[item.id]) {
          counts[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        counts[item.id].quantity += item.quantity;
        counts[item.id].revenue += item.price_sell * item.quantity;
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return isoString.split("T")[0];
    }
  };

  const paymentMethodLabels: Record<SaleItem["payment_method"], string> = {
    pix: "Pix",
    dinheiro: "Dinheiro",
    credito: "Crédito",
    debito: "Débito"
  };

  const paymentMethodStyles: Record<SaleItem["payment_method"], string> = {
    pix: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dinheiro: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    credito: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    debito: "bg-pink-500/10 text-pink-400 border-pink-500/20"
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-mono uppercase text-white/40 tracking-[0.2em]">Auditoria e Resultados</span>
          <h2 className="font-headline text-3xl font-black tracking-widest text-white mt-1 uppercase">
            VENDAS & RELATÓRIOS
          </h2>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-6 rounded-xl group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Faturamento Total</span>
            <span className="p-1.5 rounded bg-white/[0.03] text-white border border-white/10">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-white tracking-wide">
            {formatCurrency(totalRevenue)}
          </h3>
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider block mt-2">
            Bruto sobre todas as vendas
          </span>
        </div>

        {/* Profit */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-6 rounded-xl group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Lucro Líquido Real</span>
            <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-emerald-400 tracking-wide">
            {formatCurrency(totalProfit)}
          </h3>
          <span className="text-[9px] font-mono text-emerald-400/50 uppercase tracking-wider block mt-2">
            Faturamento - Custo de Aquisição
          </span>
        </div>

        {/* Ticket Medio */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-6 rounded-xl group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Ticket Médio</span>
            <span className="p-1.5 rounded bg-white/[0.03] text-white/80 border border-white/10">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-white tracking-wide">
            {formatCurrency(averageTicket)}
          </h3>
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider block mt-2">
            Média de gasto por cupom
          </span>
        </div>

        {/* Profit Margin */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-6 rounded-xl group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Margem de Lucro Média</span>
            <span className="p-1.5 rounded bg-white/[0.03] text-white/80 border border-white/10">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-white tracking-wide">
            {Math.round(averageMargin)}%
          </h3>
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider block mt-2">
            Eficiência de retorno sobre o custo
          </span>
        </div>
      </div>

      {/* Main Grid: Transaction logs and top selling products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (2/3): Transactions History Log */}
        <div className="lg:col-span-2 space-y-6 bg-[#0b0b0d] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Receipt className="w-4.5 h-4.5 text-white/70" />
            <h3 className="font-headline font-bold text-base tracking-wider text-white uppercase">Histórico de Transações</h3>
          </div>

          {sales.length > 0 ? (
            <div className="space-y-4 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2">
              {sales.map((sale) => (
                <div 
                  key={sale.id}
                  className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3 hover:border-white/10 transition-colors"
                >
                  {/* Header info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-white/35 flex items-center gap-1.5 uppercase">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(sale.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase border ${paymentMethodStyles[sale.payment_method]}`}>
                        {paymentMethodLabels[sale.payment_method]}
                      </span>

                      <button
                        onClick={() => {
                          if (window.confirm("Deseja cancelar esta venda e deletar permanentemente seu registro?")) {
                            deleteSale(sale.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                        title="Excluir transação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Items sold */}
                  <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-white/80">{item.name} <span className="text-white/40 font-mono">x{item.quantity}</span></span>
                        <span className="font-mono text-white/70">{formatCurrency(item.price_sell * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Transaction bottom summary */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                    <span className="font-mono text-white/40 uppercase">Lucro: <span className="text-emerald-400 font-bold">{formatCurrency(sale.profit)}</span></span>
                    <span className="font-mono font-bold text-white">Total: {formatCurrency(sale.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-xs text-white/30 font-mono uppercase bg-white/[0.005] border border-dashed border-white/5 rounded-lg">
              Nenhuma venda registrada no cupom ainda.
            </div>
          )}
        </div>

        {/* Right Column (1/3): Top Selling Products & Zen Quote */}
        <div className="space-y-8">
          
          {/* Top Selling Products */}
          <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-6">
              <Wine className="w-4.5 h-4.5 text-white/70" />
              <h3 className="font-headline font-bold text-base tracking-wider text-white uppercase">Campeões de Vendas</h3>
            </div>

            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((prod, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between px-4 py-3 bg-white/[0.01] border border-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-mono text-xs text-white/60">
                        {index + 1}
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-white/95 leading-tight">{prod.name}</span>
                        <span className="text-[10px] font-mono text-white/30 uppercase block">
                          Total Varejo: {formatCurrency(prod.revenue)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {prod.quantity} Saídas
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-white/30 font-mono uppercase bg-white/[0.005] border border-dashed border-white/5 rounded-lg">
                Nenhum item com saída registrada.
              </div>
            )}
          </div>

          {/* Zen Watermark Panel */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0B0B0D] to-[#040405] border border-white/5 rounded-xl p-6 min-h-[160px] flex flex-col justify-end group">
            <div className="mb-3 inline-block">
              <div className="px-3 py-1 bg-white text-black font-black font-headline text-xs tracking-widest uppercase border border-black rounded shadow-md">
                INTEGRIDADE FINANCEIRA
              </div>
            </div>
            <p className="text-[9px] text-white/50 leading-relaxed uppercase font-mono tracking-wider">
              TODAS AS TRANSAÇÕES DIÁRIAS SÃO AUDITADAS E DEDUZIDAS DIRETAMENTE DO ESTOQUE E RATEIOS SOCIETÁRIOS, ASSEGURANDO ZERO DIFERENÇAS FINANCEIRAS NO BALANÇO DE ACERTO.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
