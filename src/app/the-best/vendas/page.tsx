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
    costs
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
    const revenue = monthlySales.reduce((sum, s) => sum + s.total_amount, 0);

    // 2. Cost of Goods Sold (COGS)
    const cogs = monthlySales.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => itemSum + (item.price_cost * item.quantity), 0);
    }, 0);

    // 3. Fixed Costs
    const fixed = fixedCosts.reduce((sum, f) => sum + f.amount, 0);

    // 4. Variable Costs & installments matching this month
    const variables = costs.filter(c => {
      const d = new Date(c.date + "T12:00:00");
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
    }).reduce((sum, c) => sum + c.amount, 0);

    const netProfit = revenue - cogs - fixed - variables;

    return {
      revenue,
      cogs,
      fixed,
      variables,
      netProfit,
      salesCount: monthlySales.length
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
    debito: "Débito"
  };

  const paymentMethodStyles: Record<SaleItem["payment_method"], string> = {
    pix: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dinheiro: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    credito: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    debito: "bg-pink-500/10 text-pink-400 border-pink-500/20"
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
  const handleSettleDebt = async (id: string, method: SaleItem["payment_method"]) => {
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
          </div>

          {/* Division Split Card */}
          <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Divisão de Lucro Societário (50/50)</span>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1">
                <span className="text-[9px] font-mono text-sky-400 uppercase tracking-wider block">Quota Oliveira</span>
                <span className="text-sm font-headline font-bold text-white">
                  {formatCurrency(Math.max(0, monthlyMetrics.netProfit) / 2)}
                </span>
              </div>

              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1">
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider block">Quota Marques</span>
                <span className="text-sm font-headline font-bold text-white">
                  {formatCurrency(Math.max(0, monthlyMetrics.netProfit) / 2)}
                </span>
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
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 group">
                            <span className="font-headline font-bold text-white text-sm tracking-wide block truncate max-w-[150px]">
                              {debt.customer_name}
                            </span>
                            <button 
                              onClick={() => startEditingName(debt)}
                              className="opacity-20 group-hover:opacity-100 p-0.5 text-white/60 hover:text-white transition-opacity"
                              title="Editar nome"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
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
