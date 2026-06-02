"use client";

import React, { useState, useMemo } from "react";
import { useAdega, SaleItem, DebtItem } from "@/context/AdegaContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Trash2, 
  Wine, 
  CalendarDays,
  Percent,
  Calendar,
  User,
  Edit2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calculator,
  FileText,
  Check,
  AlertCircle,
  X
} from "lucide-react";

export default function VendasPage() {
  const { 
    sales, 
    deleteSale, 
    debts, 
    settleDebt, 
    renameDebtCustomer,
    fixedCosts,
    costs,
    stock
  } = useAdega();

  // Calendar States
  const [activeYear, setActiveYear] = useState<number>(() => new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Fiado name editing state
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Fiado settlement selection state
  const [settlingDebtId, setSettlingDebtId] = useState<string | null>(null);

  const monthsList = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Navigate calendar months
  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear(prev => prev - 1);
    } else {
      setActiveMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear(prev => prev + 1);
    } else {
      setActiveMonth(prev => prev + 1);
    }
  };

  // Pre-calculate sales by day for the active month/year
  const salesByDay = useMemo(() => {
    const map: Record<number, SaleItem[]> = {};
    sales.forEach(sale => {
      const d = new Date(sale.date);
      if (d.getFullYear() === activeYear && d.getMonth() === activeMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(sale);
      }
    });
    return map;
  }, [sales, activeYear, activeMonth]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
    const firstDayIndex = new Date(activeYear, activeMonth, 1).getDay();
    
    const days: ({ type: "empty"; id: string } | { type: "day"; dayNumber: number; id: string })[] = [];
    
    // Fill empty slots before start of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ type: "empty", id: `empty-${i}` });
    }
    
    // Fill active month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ type: "day", dayNumber: d, id: `day-${d}` });
    }
    
    return days;
  }, [activeYear, activeMonth]);

  // Calculations for current selected month/year
  const monthlyMetrics = useMemo(() => {
    // 1. Sales revenue of this month
    const monthlySales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
    });
    
    // Exclude partner withdrawals from general business revenue
    const generalSales = monthlySales.filter(s => s.payment_method !== "consumo_oliveira" && s.payment_method !== "consumo_marques");
    const revenue = generalSales.reduce((sum, s) => sum + s.total_amount, 0);

    // 2. COGS Segregation
    // Normal sales COGS
    const normalCogs = generalSales
      .filter(s => s.payment_method !== "cortesia")
      .reduce((sum, s) => {
        return sum + s.items.reduce((itemSum, item) => itemSum + (item.price_cost * item.quantity), 0);
      }, 0);

    // Courtesy sales COGS (which acts as a general marketing cost split 50/50)
    const cortesiaCogs = generalSales
      .filter(s => s.payment_method === "cortesia")
      .reduce((sum, s) => {
        return sum + s.items.reduce((itemSum, item) => itemSum + (item.price_cost * item.quantity), 0);
      }, 0);

    // Oliveira's personal consumption COGS (withdrawn directly from their quota)
    const oliveiraConsumption = monthlySales
      .filter(s => s.payment_method === "consumo_oliveira")
      .reduce((sum, s) => {
        return sum + s.items.reduce((itemSum, item) => itemSum + (item.price_cost * item.quantity), 0);
      }, 0);

    // Marques' personal consumption COGS (withdrawn directly from their quota)
    const marquesConsumption = monthlySales
      .filter(s => s.payment_method === "consumo_marques")
      .reduce((sum, s) => {
        return sum + s.items.reduce((itemSum, item) => itemSum + (item.price_cost * item.quantity), 0);
      }, 0);

    // 3. Fixed Costs
    const fixed = fixedCosts.reduce((sum, f) => sum + f.amount, 0);

    // 4. Variable Costs & installments matching this month
    const variables = costs.filter(c => {
      const d = new Date(c.date + "T12:00:00");
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
    }).reduce((sum, c) => sum + c.amount, 0);

    // Net Profit split (excludes partner consumptions, which are deducted post-split, but includes courtesy COGS)
    const netProfit = revenue - normalCogs - cortesiaCogs - fixed - variables;

    return {
      revenue,
      cogs: normalCogs,
      cortesia: cortesiaCogs,
      oliveiraConsumption,
      marquesConsumption,
      fixed,
      variables,
      netProfit,
      salesCount: generalSales.filter(s => s.payment_method !== "cortesia").length,
      totalSalesCount: monthlySales.length
    };
  }, [sales, fixedCosts, costs, activeYear, activeMonth]);

  // Overall statistics (All time)
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
  }, [totalRevenue, totalProfit]);

  // 1. Sales by weekday (Sun to Sat) for the active month/year
  const salesByWeekday = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    sales.forEach(sale => {
      const d = new Date(sale.date);
      if (d.getFullYear() === activeYear && d.getMonth() === activeMonth) {
        counts[d.getDay()] += sale.total_amount;
      }
    });
    const maxVal = Math.max(...counts, 1);
    return counts.map((val, idx) => ({
      day: weekdays[idx],
      val,
      percentage: (val / maxVal) * 100
    }));
  }, [sales, activeYear, activeMonth]);

  // 2. Top 5 best selling products of the active month/year
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};
    sales.forEach(sale => {
      const d = new Date(sale.date);
      if (d.getFullYear() === activeYear && d.getMonth() === activeMonth) {
        sale.items.forEach(item => {
          if (!counts[item.id]) {
            counts[item.id] = { name: item.name, qty: 0, revenue: 0 };
          }
          counts[item.id].qty += item.quantity;
          counts[item.id].revenue += item.price_sell * item.quantity;
        });
      }
    });
    const sorted = Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5);
    const maxQty = sorted[0]?.qty || 1;
    return sorted.map(p => ({
      ...p,
      relativePercentage: (p.qty / maxQty) * 100
    }));
  }, [sales, activeYear, activeMonth]);

  // 3. Margin alerts for products in stock (under 35% margin)
  const marginAlerts = useMemo(() => {
    const alerts: { id: string; name: string; cost: number; sell: number; margin: number }[] = [];
    stock.forEach(item => {
      if (item.price_cost && item.price_sell && item.price_sell > 0) {
        const margin = ((item.price_sell - item.price_cost) / item.price_sell) * 100;
        if (margin < 35) {
          alerts.push({
            id: item.id,
            name: item.name,
            cost: item.price_cost,
            sell: item.price_sell,
            margin
          });
        }
      }
    });
    return alerts.sort((a, b) => a.margin - b.margin);
  }, [stock]);

  // Active filter based on calendar day selection
  const filteredSales = useMemo(() => {
    if (selectedDay === null) {
      // If no day is selected, show active month sales first, or all sales
      return sales.filter(s => {
        const d = new Date(s.date);
        return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
      });
    }
    return sales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth && d.getDate() === selectedDay;
    });
  }, [sales, selectedDay, activeYear, activeMonth]);

  // List of active pending debts
  const pendingDebts = useMemo(() => {
    return debts.filter(d => d.status === "pending" || !d.status);
  }, [debts]);

  const totalDebtsAmount = useMemo(() => {
    return pendingDebts.reduce((sum, d) => sum + d.amount, 0);
  }, [pendingDebts]);

  // Helper formatting utilities
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
    debito: "Débito",
    consumo_oliveira: "Consumo Oliveira",
    consumo_marques: "Consumo Marques",
    cortesia: "Cortesia"
  };

  const paymentMethodStyles: Record<SaleItem["payment_method"], string> = {
    pix: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dinheiro: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    credito: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    debito: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    consumo_oliveira: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    consumo_marques: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    cortesia: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
  };

  // Handle renaming of debt devedor
  const startEditingName = (debt: DebtItem) => {
    setEditingDebtId(debt.id);
    setEditingName(debt.customer_name);
  };

  const saveRename = async (id: string) => {
    if (!editingName.trim()) return;
    await renameDebtCustomer(id, editingName);
    setEditingDebtId(null);
  };

  // Settle single debt record
  const handleSettleDebt = async (id: string, method: "pix" | "dinheiro" | "credito" | "debito") => {
    await settleDebt(id, method);
    setSettlingDebtId(null);
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-mono uppercase text-white/40 tracking-[0.2em]">Auditoria e BI Financeiro</span>
          <h2 className="font-headline text-3xl font-black tracking-widest text-white mt-1 uppercase">
            VENDAS & RESULTADOS
          </h2>
        </div>
      </div>

      {/* Analytics Summary Cards (Global baseline indicators) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-4 sm:p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Faturamento Total</span>
            <span className="p-1 rounded bg-white/[0.03] text-white border border-white/10">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-headline font-bold text-white tracking-wide">
            {formatCurrency(totalRevenue)}
          </h3>
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider block mt-1">
            Bruto sobre todas as vendas
          </span>
        </div>

        {/* Profit */}
        <div className="bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-4 sm:p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Lucro Líquido Real</span>
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-headline font-bold text-emerald-400 tracking-wide">
            {formatCurrency(totalProfit)}
          </h3>
          <span className="text-[9px] font-mono text-emerald-400/50 uppercase tracking-wider block mt-1">
            Faturamento - Aquisição
          </span>
        </div>

        {/* Ticket Medio */}
        <div className="bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-4 sm:p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Ticket Médio</span>
            <span className="p-1 rounded bg-white/[0.03] text-white/80 border border-white/10">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-headline font-bold text-white tracking-wide">
            {formatCurrency(averageTicket)}
          </h3>
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider block mt-1">
            Média por cupom emitido
          </span>
        </div>

        {/* Total Fiados Active */}
        <div className="bg-gradient-to-br from-[#0e0e11] to-[#070709] border border-white/5 p-4 sm:p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider">Carteira de Fiado</span>
            <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <User className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-headline font-bold text-amber-400 tracking-wide">
            {formatCurrency(totalDebtsAmount)}
          </h3>
          <span className="text-[9px] font-mono text-amber-400/50 uppercase tracking-wider block mt-1">
            {pendingDebts.length} contas pendentes
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Calendar & Societal DRE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side (7 Cols): Calendar Panel */}
        <div className="lg:col-span-7 bg-[#0b0b0d] border border-white/5 rounded-xl p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4.5 h-4.5 text-white/70" />
              <h3 className="font-headline font-bold text-sm tracking-wider text-white uppercase">Faturamento Diário</h3>
            </div>
            
            {/* Month Nav Controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white whitespace-nowrap">
                {monthsList[activeMonth]} {activeYear}
              </span>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Month Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekdays.map(day => (
                <span key={day} className="text-[9px] font-mono text-white/30 uppercase tracking-widest py-1">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map((item, idx) => {
                if (item.type === "empty") {
                  return <div key={item.id} className="aspect-square" />;
                }

                const dayNum = item.dayNumber;
                const hasSales = !!salesByDay[dayNum];
                const isSelected = selectedDay === dayNum;
                
                // Calculate total revenue for this day
                const daySalesRevenue = hasSales 
                  ? salesByDay[dayNum].reduce((sum, s) => sum + s.total_amount, 0)
                  : 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDay(null);
                      } else {
                        setSelectedDay(dayNum);
                      }
                    }}
                    className={`aspect-square relative flex flex-col justify-between p-1 rounded border transition-all duration-300 ${
                      isSelected
                        ? "bg-white text-black border-white shadow-lg shadow-white/5 scale-102"
                        : hasSales 
                          ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60 text-white"
                          : "bg-white/[0.01] border-white/5 hover:border-white/10 text-white/60"
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-semibold ${isSelected ? "text-black" : "text-white/80"}`}>
                      {dayNum}
                    </span>

                    {/* Glowing sale dot or micro-price indicator */}
                    {hasSales && (
                      <span className={`w-1.5 h-1.5 rounded-full mx-auto ${
                        isSelected ? "bg-black" : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                      }`} />
                    )}

                    {/* Super tiny indicator of revenue if it exists (desktop only) */}
                    {hasSales && (
                      <span className={`hidden sm:block text-[7px] font-mono leading-none tracking-tight overflow-hidden text-center truncate ${
                        isSelected ? "text-black/60" : "text-emerald-400/80"
                      }`}>
                        {Math.round(daySalesRevenue)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats on selected day */}
          {selectedDay !== null && (
            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-mono text-white/40 uppercase">Dia Selecionado:</span>
                <p className="font-headline font-bold text-white uppercase tracking-wider">
                  {selectedDay.toString().padStart(2, "0")} de {monthsList[activeMonth]}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-white/40 uppercase block">Faturamento do Dia:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {formatCurrency(salesByDay[selectedDay]?.reduce((sum, s) => sum + s.total_amount, 0) || 0)}
                </span>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded hover:bg-white/5 text-white/50 hover:text-white"
                title="Limpar filtro"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side (5 Cols): DRE Societário (Societal P&L) */}
        <div className="lg:col-span-5 bg-[#0b0b0d] border border-white/5 rounded-xl p-4 sm:p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <Calculator className="w-4.5 h-4.5 text-white/70" />
              <h3 className="font-headline font-bold text-sm tracking-wider text-white uppercase">DRE Societário</h3>
            </div>

            <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider leading-relaxed">
              Demonstrativo de Resultado de Exercício consolidando o faturamento e todas as despesas amortizadas em <span className="text-white font-bold">{monthsList[activeMonth]} de {activeYear}</span>.
            </p>

            {/* DRE Rows */}
            <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-xl">
              
              {/* Row 1: Faturamento */}
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <div className="space-y-0.5">
                  <span className="font-bold text-white/90">Faturamento Bruto (A)</span>
                  <span className="text-[9px] font-mono text-white/30 block">{monthlyMetrics.salesCount} vendas no mês</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(monthlyMetrics.revenue)}</span>
              </div>

              {/* Row 2: COGS */}
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <div className="space-y-0.5">
                  <span className="text-white/70">(-) Custo de Aquisição (COGS)</span>
                  <span className="text-[9px] font-mono text-white/30 block">Valor investido no estoque vendido</span>
                </div>
                <span className="font-mono text-red-400/80 font-medium">-{formatCurrency(monthlyMetrics.cogs)}</span>
              </div>

              {/* Row 2.5: Cortesia */}
              {monthlyMetrics.cortesia > 0 && (
                <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-white/70">(-) Cortesias (Mkt Geral)</span>
                    <span className="text-[9px] font-mono text-white/30 block">Custo de bebidas oferecidas como cortesia</span>
                  </div>
                  <span className="font-mono text-yellow-500/80 font-medium">-{formatCurrency(monthlyMetrics.cortesia)}</span>
                </div>
              )}

              {/* Row 3: Contas Fixas */}
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <div className="space-y-0.5">
                  <span className="text-white/70">(-) Contas Fixas (B)</span>
                  <span className="text-[9px] font-mono text-white/30 block">Custos recorrentes (aluguel, etc.)</span>
                </div>
                <span className="font-mono text-amber-500/80 font-medium">-{formatCurrency(monthlyMetrics.fixed)}</span>
              </div>

              {/* Row 4: Custos Variáveis & Parcelas */}
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <div className="space-y-0.5">
                  <span className="text-white/70">(-) Investimentos e Parcelas (C)</span>
                  <span className="text-[9px] font-mono text-white/30 block">Custos variáveis e parcelas do mês</span>
                </div>
                <span className="font-mono text-amber-500/80 font-medium">-{formatCurrency(monthlyMetrics.variables)}</span>
              </div>

              {/* Resultado Líquido */}
              <div className="flex justify-between items-center pt-2">
                <div className="space-y-0.5">
                  <span className="font-headline text-xs font-bold text-white uppercase tracking-wider">Lucro Líquido Real</span>
                  <span className="text-[9px] font-mono text-white/30 block">Disponível para distribuição</span>
                </div>
                <span className={`font-headline text-base font-bold ${
                  monthlyMetrics.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {formatCurrency(monthlyMetrics.netProfit)}
                </span>
              </div>

            </div>

            {/* Ponto de Equilíbrio (Breakeven) Progress Bar - Idea 4 */}
            {(() => {
              const totalExpenses = monthlyMetrics.cogs + monthlyMetrics.cortesia + monthlyMetrics.fixed + monthlyMetrics.variables;
              const isBreakevenReached = monthlyMetrics.revenue >= totalExpenses && totalExpenses > 0;
              const progressPercent = totalExpenses > 0 ? Math.min(100, (monthlyMetrics.revenue / totalExpenses) * 100) : 0;
              const leftToBreakeven = Math.max(0, totalExpenses - monthlyMetrics.revenue);

              return (
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl space-y-3 relative overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.01)]">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Ponto de Equilíbrio</span>
                      <span className="text-[9px] font-mono text-white/20 uppercase block">Meta de Faturamento Comercial</span>
                    </div>
                    {isBreakevenReached ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.15)] animate-pulse">
                        Equilíbrio Atingido 🎉
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Faltam {formatCurrency(leftToBreakeven)}
                      </span>
                    )}
                  </div>

                  {/* Neon Glowing Progress Bar Container */}
                  <div className="w-full h-2.5 bg-white/[0.02] border border-white/5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isBreakevenReached 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" 
                          : "bg-gradient-to-r from-sky-500 to-indigo-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase">
                    <span>Faturado: {formatCurrency(monthlyMetrics.revenue)}</span>
                    <span>Custo Total: {formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Division Split Card - Idea 2 */}
          <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl space-y-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Divisão de Lucro Societário (50/50)</span>
              <p className="text-[8px] font-mono text-white/20 uppercase">COGS de Consumo Próprio é debitado da quota do respectivo sócio</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Oliveira Card */}
              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/[0.01] rounded-full blur-xl pointer-events-none" />
                <span className="text-[9px] font-mono text-sky-400 uppercase tracking-wider block font-bold">Oliveira</span>
                
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-white/40">
                    <span>Quota Base (50%):</span>
                    <span>{formatCurrency(Math.max(0, monthlyMetrics.netProfit) / 2)}</span>
                  </div>
                  <div className="flex justify-between text-red-400/80">
                    <span>Retirada (COGS):</span>
                    <span>-{formatCurrency(monthlyMetrics.oliveiraConsumption)}</span>
                  </div>
                  <div className="border-t border-white/5 pt-1 flex justify-between text-white font-bold text-xs mt-1">
                    <span className="text-white/80">Total Líquido:</span>
                    <span className="text-sky-400">
                      {formatCurrency(Math.max(0, (Math.max(0, monthlyMetrics.netProfit) / 2) - monthlyMetrics.oliveiraConsumption))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Marques Card */}
              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/[0.01] rounded-full blur-xl pointer-events-none" />
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider block font-bold">Marques</span>
                
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-white/40">
                    <span>Quota Base (50%):</span>
                    <span>{formatCurrency(Math.max(0, monthlyMetrics.netProfit) / 2)}</span>
                  </div>
                  <div className="flex justify-between text-red-400/80">
                    <span>Retirada (COGS):</span>
                    <span>-{formatCurrency(monthlyMetrics.marquesConsumption)}</span>
                  </div>
                  <div className="border-t border-white/5 pt-1 flex justify-between text-white font-bold text-xs mt-1">
                    <span className="text-white/80">Total Líquido:</span>
                    <span className="text-purple-400">
                      {formatCurrency(Math.max(0, (Math.max(0, monthlyMetrics.netProfit) / 2) - monthlyMetrics.marquesConsumption))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <AlertCircle className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
              <p className="text-[8px] font-mono text-white/30 leading-relaxed uppercase">
                A amortização de parcelas passadas ocorre de forma transparente sobre o mês correspondente da compra, preservando lucros futuros.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* SEÇÃO 3: INTELIGÊNCIA DE NEGÓCIOS & MARGENS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bloco A: BI & Pico de Vendas */}
        <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="font-headline font-bold text-base tracking-wider text-white uppercase">Inteligência de Vendas (BI)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gráfico de Vendas por Dia da Semana */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Pico de Faturamento (Semanal)</span>
              
              <div className="flex justify-between items-end h-32 pt-6 px-1 border-b border-white/5 relative">
                {salesByWeekday.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                    <span className="opacity-0 group-hover:opacity-100 absolute top-0 text-[8px] font-mono bg-white text-black px-1.5 py-0.5 rounded transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                      {formatCurrency(day.val)}
                    </span>
                    <div 
                      className="w-4 sm:w-5 bg-gradient-to-t from-emerald-500/10 to-emerald-400 rounded-t border-t border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)] transition-all duration-500" 
                      style={{ height: `${Math.max(5, day.percentage)}%` }} 
                    />
                    <span className="text-[8px] font-mono text-white/40 uppercase">{day.day}</span>
                  </div>
                ))}
              </div>
              <span className="text-[8px] font-mono text-white/30 uppercase block text-center mt-1">Faturamento acumulado por dia da semana</span>
            </div>

            {/* Top 5 Produtos mais Vendidos */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Top 5 Produtos mais Vendidos</span>
              
              {topProducts.length > 0 ? (
                <div className="space-y-2">
                  {topProducts.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-end text-[10px]">
                        <span className="font-semibold text-white/80 truncate max-w-[130px]">{p.name}</span>
                        <span className="font-mono text-white/40">{p.qty} unid.</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                        <div 
                          className="absolute inset-y-0 left-0 bg-emerald-400 rounded-full" 
                          style={{ width: `${p.relativePercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-[10px] font-mono uppercase text-white/30 border border-dashed border-white/5 rounded-lg flex items-center justify-center">
                  Sem vendas registradas
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bloco B: Saúde Financeira & Margens */}
        <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Percent className="w-4.5 h-4.5 text-sky-400" />
              <h3 className="font-headline font-bold text-base tracking-wider text-white uppercase">Saúde & Precificação</h3>
            </div>
            
            {/* Health Badge */}
            {monthlyMetrics.revenue > 0 ? (
              <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                ((monthlyMetrics.revenue - monthlyMetrics.cogs) / monthlyMetrics.revenue * 100) >= 35
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.1)]"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                {((monthlyMetrics.revenue - monthlyMetrics.cogs) / monthlyMetrics.revenue * 100) >= 35
                  ? "Margem Excelente"
                  : "Margem sob Atenção"
                }
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded text-[9px] font-mono text-white/30 uppercase border border-white/5 bg-white/[0.01]">
                Sem dados
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Margem de Contribuição Geral */}
            <div className="md:col-span-5 bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">Margem de Contribuição</span>
                <span className="text-2xl font-headline font-black text-white mt-1 block tracking-wide">
                  {monthlyMetrics.revenue > 0 
                    ? `${Math.round(((monthlyMetrics.revenue - monthlyMetrics.cogs) / monthlyMetrics.revenue) * 100)}%`
                    : "0%"
                  }
                </span>
              </div>
              <span className="text-[8px] font-mono text-white/35 leading-tight uppercase block">
                Faturamento líquido do COGS: <span className="text-white font-bold">{formatCurrency(monthlyMetrics.revenue - monthlyMetrics.cogs)}</span>
              </span>
            </div>

            {/* Lista de Alertas de Margem por Produto */}
            <div className="md:col-span-7 space-y-2">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block flex items-center justify-between">
                <span>Alertas de Margem Crítica (&lt;35%)</span>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">{marginAlerts.length} itens</span>
              </span>

              {marginAlerts.length > 0 ? (
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {marginAlerts.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] bg-white/[0.01] border border-white/5 px-2.5 py-1.5 rounded hover:border-white/10 transition-colors">
                      <div className="min-w-0">
                        <span className="font-semibold text-white/80 block truncate max-w-[120px]">{item.name}</span>
                        <span className="font-mono text-white/30 text-[8px] block">
                          Custo: {formatCurrency(item.cost)} • Venda: {formatCurrency(item.sell)}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-rose-400">
                        {Math.round(item.margin)}% Margem
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[9px] font-mono uppercase text-emerald-400 border border-dashed border-emerald-500/20 bg-emerald-500/5 rounded-lg flex flex-col items-center justify-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Todas as margens da adega saudáveis!</span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Livro Negro do Fiado - Customer Debts module */}
      <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
          <User className="w-4.5 h-4.5 text-amber-400" />
          <h3 className="font-headline font-bold text-base tracking-wider text-white uppercase">Controle de Fiados (Clientes Pendentes)</h3>
        </div>

        {pendingDebts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingDebts.map((debt) => {
              const isEditing = editingDebtId === debt.id;
              const isSettling = settlingDebtId === debt.id;

              return (
                <div 
                  key={debt.id} 
                  className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-4 hover:border-white/10 transition-colors relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Customer Name and Rename trigger */}
                    <div className="flex justify-between items-start gap-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                          <input 
                            type="text" 
                            value={editingName} 
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-black border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none w-full font-mono"
                          />
                          <button 
                            onClick={() => saveRename(debt.id)}
                            className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            title="Salvar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setEditingDebtId(null)}
                            className="p-1.5 rounded bg-white/5 text-white/50"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {(() => {
                            const customerTotalDebt = pendingDebts
                              .filter(d => d.customer_name.toLowerCase().trim() === debt.customer_name.toLowerCase().trim())
                              .reduce((sum, d) => sum + d.amount, 0);

                            const scoreBadge = customerTotalDebt >= 150 
                              ? { label: "Bloqueado", styles: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)] font-bold animate-pulse" }
                              : customerTotalDebt > 50
                              ? { label: "Atrasado", styles: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
                              : { label: "Regular", styles: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };

                            return (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 group">
                                  <span className="font-headline font-bold text-white text-sm tracking-wide block truncate max-w-[120px]" title={debt.customer_name}>
                                    {debt.customer_name}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[7px] font-mono uppercase border ${scoreBadge.styles}`}>
                                    {scoreBadge.label}
                                  </span>
                                  <button 
                                    onClick={() => startEditingName(debt)}
                                    className="opacity-20 group-hover:opacity-100 p-0.5 text-white/60 hover:text-white transition-opacity"
                                    title="Editar nome"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="text-[8px] font-mono text-white/30 uppercase block">Total Devido: {formatCurrency(customerTotalDebt)}</span>
                              </div>
                            );
                          })()}
                          <span className="text-[9px] font-mono text-white/35 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(debt.date)}
                          </span>
                        </div>
                      )}

                      {!isEditing && (
                        <span className="font-mono text-base font-bold text-amber-400 whitespace-nowrap">
                          {formatCurrency(debt.amount)}
                        </span>
                      )}
                    </div>

                    {/* Bought Products List */}
                    <div className="space-y-1 bg-black/50 p-2.5 rounded border border-white/5 text-[11px] max-h-[85px] overflow-y-auto">
                      {debt.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-white/70">
                          <span className="truncate max-w-[120px]">{item.name} <span className="text-white/30">x{item.quantity}</span></span>
                          <span className="font-mono text-white/40">{formatCurrency(item.price_sell * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer actions: Settle fiado */}
                  <div className="pt-3 border-t border-white/5 mt-3">
                    {isSettling ? (
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block text-center">Selecionar método de quitação:</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(["pix", "dinheiro", "credito", "debito"] as const).map((method) => (
                            <button
                              key={method}
                              onClick={() => handleSettleDebt(debt.id, method)}
                              className="py-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase hover:bg-emerald-500/20 font-bold transition-all text-center"
                            >
                              {paymentMethodLabels[method]}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setSettlingDebtId(null)}
                          className="w-full mt-1.5 py-1 text-[9px] font-mono uppercase bg-white/5 text-white/50 hover:text-white rounded text-center"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSettlingDebtId(debt.id)}
                        className="w-full py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-headline font-semibold text-xs tracking-wider uppercase rounded hover:bg-amber-500/25 transition-all text-center"
                      >
                        Quitar Fiado
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-white/30 font-mono uppercase bg-white/[0.005] border border-dashed border-white/5 rounded-xl">
            Nenhum fiado registrado no livro negro.
          </div>
        )}
      </div>

      {/* Transaction Logs (Below calendar/DRE, matches filtered search) */}
      <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Receipt className="w-4.5 h-4.5 text-white/70" />
            <h3 className="font-headline font-bold text-base tracking-wider text-white uppercase">Histórico de Cupons</h3>
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase">
            Exibindo {filteredSales.length} transações
          </span>
        </div>

        {filteredSales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto pr-2">
            {filteredSales.map((sale) => (
              <div 
                key={sale.id}
                className="p-4 bg-[#050505] border border-white/5 rounded-xl space-y-3 hover:border-white/10 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[9px] font-mono text-white/35 flex items-center gap-1 uppercase">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(sale.date)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider uppercase border ${paymentMethodStyles[sale.payment_method]}`}>
                        {paymentMethodLabels[sale.payment_method]}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm("Deseja cancelar esta venda e deletar permanentemente seu registro?")) {
                            deleteSale(sale.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                        title="Cancelar venda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 bg-black/40 p-2.5 rounded border border-white/5 text-xs">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-white/80 max-w-[150px] truncate">{item.name} <span className="text-white/30 font-mono">x{item.quantity}</span></span>
                        <span className="font-mono text-white/60">{formatCurrency(item.price_sell * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs mt-3">
                  <span className="font-mono text-white/40 uppercase">Lucro: <span className="text-emerald-400 font-bold">{formatCurrency(sale.profit)}</span></span>
                  <span className="font-mono font-bold text-white">Total: {formatCurrency(sale.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-xs text-white/30 font-mono uppercase bg-white/[0.005] border border-dashed border-white/5 rounded-lg">
            Nenhuma venda correspondente neste período.
          </div>
        )}
      </div>

    </div>
  );
}
