"use client";

import React, { useState } from "react";
import { useAdega } from "@/context/AdegaContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Check, 
  Filter, 
  User, 
  Users, 
  PlusCircle, 
  RotateCcw, 
  TrendingUp, 
  AlertCircle,
  X,
  CreditCard,
  Calendar,
  Paperclip,
  FileText
} from "lucide-react";

export default function ContasFixasPage() {
  const { 
    fixedCosts, 
    addFixedCost, 
    toggleFixedCostPaid, 
    deleteFixedCost 
  } = useAdega();

  // Filters
  const [fixedFilter, setFixedFilter] = useState<"all" | "gu" | "melhor" | "ambos" | "pending">("all");
  const [isAddingFixed, setIsAddingFixed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Form states
  const [fixedDesc, setFixedDesc] = useState("");
  const [fixedVal, setFixedVal] = useState("");
  const [fixedDueDay, setFixedDueDay] = useState("5");
  const [fixedAssignee, setFixedAssignee] = useState<"gu" | "melhor" | "ambos">("ambos");
  const [fixedReceipt, setFixedReceipt] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [selectedReceipt, setSelectedReceipt] = useState<{ title: string; url: string } | null>(null);

  // Calculations
  const totalGeral = fixedCosts.reduce((sum, item) => sum + item.amount, 0);
  
  const totalGu = fixedCosts.reduce((sum, item) => {
    if (item.assignee === "gu") return sum + item.amount;
    if (item.assignee === "ambos") return sum + (item.amount / 2);
    return sum;
  }, 0);

  const totalMelhor = fixedCosts.reduce((sum, item) => {
    if (item.assignee === "melhor") return sum + item.amount;
    if (item.assignee === "ambos") return sum + (item.amount / 2);
    return sum;
  }, 0);

  const totalPago = fixedCosts.filter(f => f.paidThisMonth).reduce((sum, item) => sum + item.amount, 0);
  const totalPendente = totalGeral - totalPago;
  
  const progressoPorcentagem = totalGeral > 0 ? Math.round((totalPago / totalGeral) * 100) : 0;

  const filteredFixed = fixedCosts.filter((f) => {
    if (fixedFilter === "gu") return f.assignee === "gu";
    if (fixedFilter === "melhor") return f.assignee === "melhor";
    if (fixedFilter === "ambos") return f.assignee === "ambos";
    if (fixedFilter === "pending") return !f.paidThisMonth;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixedDesc.trim() || !fixedVal || !fixedDueDay) return;

    const dueDayNum = parseInt(fixedDueDay);
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
      alert("Por favor, insira um dia de vencimento válido (1 a 31).");
      return;
    }

    const success = await addFixedCost(fixedDesc, fixedVal, dueDayNum, fixedAssignee, fixedReceipt);
    if (success) {
      setFixedDesc("");
      setFixedVal("");
      setFixedDueDay("5");
      setFixedAssignee("ambos");
      setFixedReceipt("");
      setReceiptFileName("");
      setIsAddingFixed(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo é muito grande. O limite máximo é de 2MB para garantir a performance.");
        return;
      }
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setFixedReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetAll = async () => {
    const confirmReset = window.confirm("Deseja zerar os status de pagamento de todas as contas fixas para iniciar um novo ciclo mensal?");
    if (!confirmReset) return;
    
    // We toggle the ones that are paid back to unpaid
    const paidItems = fixedCosts.filter(f => f.paidThisMonth);
    for (const item of paidItems) {
      await toggleFixedCostPaid(item.id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-mono uppercase text-white/40 tracking-[0.2em]">Despesas Recorrentes</span>
          <h2 className="font-headline text-3xl font-black tracking-widest text-white mt-1 uppercase">
            CONTAS FIXAS
          </h2>
        </div>

        <div className="flex gap-2">
          {fixedCosts.some(f => f.paidThisMonth) && (
            <button 
              onClick={handleResetAll}
              className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/10 text-white/80 hover:text-white font-semibold font-headline text-xs tracking-wider rounded uppercase transition-all duration-300"
              title="Zerar todos os pagamentos do mês"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Novo Ciclo
            </button>
          )}

          <button 
            onClick={() => setIsAddingFixed(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold font-headline text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Lançar Conta
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Recorrente */}
        <div className="bg-[#0b0b0d] border border-white/5 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Custo Fixo Total</span>
          <div>
            <span className="text-xl font-headline font-bold text-white tracking-wide block mt-2">
              {formatCurrency(totalGeral)}
            </span>
            <span className="text-[9px] text-white/30 font-mono uppercase">Soma de todos os contratos</span>
          </div>
        </div>

        {/* Gu's Share */}
        <div className="bg-[#0b0b0d] border border-white/5 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Parcela do Gu</span>
          <div>
            <span className="text-xl font-headline font-bold text-sky-400 tracking-wide block mt-2">
              {formatCurrency(totalGu)}
            </span>
            <span className="text-[9px] text-white/30 font-mono uppercase">Individuais + 50% de Ambos</span>
          </div>
        </div>

        {/* Melhor's Share */}
        <div className="bg-[#0b0b0d] border border-white/5 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Parcela do Melhor</span>
          <div>
            <span className="text-xl font-headline font-bold text-purple-400 tracking-wide block mt-2">
              {formatCurrency(totalMelhor)}
            </span>
            <span className="text-[9px] text-white/30 font-mono uppercase">Individuais + 50% de Ambos</span>
          </div>
        </div>

        {/* Month Progress */}
        <div className="bg-white/[0.02] border border-white/10 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider">Progresso de Quitação</span>
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between items-end">
              <span className="text-sm font-headline font-semibold text-white">
                {formatCurrency(totalPago)} <span className="text-[9px] text-white/40 font-mono">PAGO</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{progressoPorcentagem}%</span>
            </div>
            
            {/* Elegant micro progress bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressoPorcentagem}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Content Card */}
      <div className="bg-[#0b0b0d] border border-white/5 rounded-xl overflow-hidden">
        
        {/* Table Controls */}
        <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Filtros</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Todas" },
              { id: "gu", label: "Só Oliveira" },
              { id: "melhor", label: "Só Marques" },
              { id: "ambos", label: "Só Ambos (50-50)" },
              { id: "pending", label: "Pendentes do Mês" },
            ].map((f) => (
              <button 
                key={f.id}
                onClick={() => setFixedFilter(f.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all duration-300 ${
                  fixedFilter === f.id 
                    ? "bg-white text-black font-semibold" 
                    : "bg-white/[0.02] border border-white/5 text-white/60 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Expense Table / Card List */}
        <div>
          {filteredFixed.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-mono text-white/40 uppercase tracking-widest bg-white/[0.005]">
                      <th className="px-6 py-4">Descrição da Conta</th>
                      <th className="px-6 py-4">Responsável</th>
                      <th className="px-6 py-4">Dia Vencimento</th>
                      <th className="px-6 py-4">Valor Mensal</th>
                      <th className="px-6 py-4 text-center">Status no Mês</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredFixed.map((f) => (
                      <tr key={f.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4 font-medium text-white/90">
                          <span className="flex items-center gap-2">
                            {f.description}
                            {f.receipt && (
                              <button
                                onClick={() => setSelectedReceipt({ title: f.description, url: f.receipt! })}
                                className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-colors"
                                title="Ver comprovante anexado"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </span>
                        </td>
                        
                        {/* Assignee Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border ${
                            f.assignee === "gu" 
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                              : f.assignee === "melhor"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {f.assignee === "ambos" ? (
                              <Users className="w-2.5 h-2.5" />
                            ) : (
                              <User className="w-2.5 h-2.5" />
                            )}
                            {f.assignee === "ambos" ? "Ambos 50/50" : f.assignee === "gu" ? "Oliveira" : "Marques"}
                          </span>
                        </td>

                        {/* Due Day */}
                        <td className="px-6 py-4 text-xs font-mono text-white/60">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-white/20" />
                            Todo dia {f.dueDay}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 font-mono font-semibold text-white">{formatCurrency(f.amount)}</td>

                        {/* Payment status toggle */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => toggleFixedCostPaid(f.id)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono tracking-wider uppercase border transition-all duration-300 ${
                                f.paidThisMonth 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-550/15" 
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-550/15"
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 ${f.paidThisMonth ? "opacity-100" : "opacity-30"}`} />
                              {f.paidThisMonth ? "Pago" : "Pendente"}
                            </button>
                          </div>
                        </td>

                        {/* Delete Item */}
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => deleteFixedCost(f.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all duration-300"
                            title="Deletar conta recorrente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="block lg:hidden divide-y divide-white/5">
                {filteredFixed.map((f) => (
                  <div key={f.id} className="p-5 space-y-4 hover:bg-white/[0.005] transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="font-medium text-white text-sm leading-snug">{f.description}</h4>
                        <span className="text-[10px] font-mono text-white/45 flex items-center gap-1.5 uppercase block mt-1">
                          <Calendar className="w-3.5 h-3.5 text-white/30 inline" /> Todo dia {f.dueDay}
                        </span>
                      </div>
                      <span className="text-base font-mono font-bold text-white whitespace-nowrap">
                        {formatCurrency(f.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase border ${
                          f.assignee === "gu" 
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                            : f.assignee === "melhor"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {f.assignee === "ambos" ? (
                            <Users className="w-2.5 h-2.5" />
                          ) : (
                            <User className="w-2.5 h-2.5" />
                          )}
                          {f.assignee === "ambos" ? "Ambos 50/50" : f.assignee === "gu" ? "Oliveira" : "Marques"}
                        </span>
                        {f.receipt && (
                          <button
                            onClick={() => setSelectedReceipt({ title: f.description, url: f.receipt! })}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 transition-all"
                          >
                            <Paperclip className="w-2.5 h-2.5" />
                            Comprovante
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleFixedCostPaid(f.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-mono tracking-wider uppercase border transition-all duration-300 ${
                            f.paidThisMonth 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {f.paidThisMonth ? "Pago" : "Pendente"}
                        </button>

                        <button 
                          onClick={() => deleteFixedCost(f.id)}
                          className="p-2.5 rounded-md bg-white/[0.02] border border-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                          title="Deletar conta recorrente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-white/30 font-mono uppercase bg-white/[0.005]">
              Nenhuma conta recorrente cadastrada ou encontrada no filtro.
            </div>
          )}
        </div>
      </div>

      {/* Sliding Form Drawer */}
      <AnimatePresence>
        {isAddingFixed && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end bg-black/60 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingFixed(false)}
              className="absolute inset-0"
            />
            {/* Drawer */}
            <motion.div 
              initial={isMobile ? { translateY: "100%", translateX: 0 } : { translateX: "100%", translateY: 0 }}
              animate={isMobile ? { translateY: 0, translateX: 0 } : { translateX: 0, translateY: 0 }}
              exit={isMobile ? { translateY: "100%", translateX: 0 } : { translateX: "100%", translateY: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`relative bg-[#0e0e10] p-6 flex flex-col z-10 shadow-2xl justify-between ${
                isMobile 
                  ? "w-full h-[85vh] rounded-t-2xl border-t border-white/10" 
                  : "w-full max-w-md h-full border-l border-white/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-white/80" />
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white uppercase">CADASTRAR CONTA FIXA</h3>
                  </div>
                  <button 
                    onClick={() => setIsAddingFixed(false)}
                    className="p-1 rounded text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Descrição do Item</label>
                    <input 
                      type="text" 
                      required
                      value={fixedDesc}
                      onChange={(e) => setFixedDesc(e.target.value)}
                      placeholder="Ex: Aluguel da Adega, Provedor de Internet"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm"
                    />
                  </div>

                  {/* Monthly Value */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Valor Mensal (R$)</label>
                    <input 
                      type="text" 
                      required
                      value={fixedVal}
                      onChange={(e) => setFixedVal(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm font-mono"
                    />
                  </div>

                  {/* Due Day */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Dia do Vencimento (1 a 31)</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      max={31}
                      value={fixedDueDay}
                      onChange={(e) => setFixedDueDay(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm font-mono"
                    />
                  </div>

                  {/* Assignee Choice */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block">Responsabilidade da Conta</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        type="button"
                        onClick={() => setFixedAssignee("gu")}
                        className={`py-2 px-3 rounded text-xs font-mono uppercase border transition-all duration-300 ${
                          fixedAssignee === "gu" 
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30 font-bold" 
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"
                        }`}
                      >
                        Só Oliveira
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFixedAssignee("melhor")}
                        className={`py-2 px-3 rounded text-xs font-mono uppercase border transition-all duration-300 ${
                          fixedAssignee === "melhor" 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold" 
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"
                        }`}
                      >
                        Só Marques
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFixedAssignee("ambos")}
                        className={`py-2 px-3 rounded text-xs font-mono uppercase border transition-all duration-300 ${
                          fixedAssignee === "ambos" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold" 
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"
                        }`}
                      >
                        Ambos (50%)
                      </button>
                    </div>
                  </div>

                  {/* Comprovante */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block">Comprovante (Imagem ou PDF)</label>
                    {!fixedReceipt ? (
                      <div className="relative border border-dashed border-white/10 hover:border-white/20 rounded px-3 py-4 bg-black/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Paperclip className="w-5 h-5 text-white/40" />
                        <span className="text-[10px] font-mono uppercase text-white/55 text-center">
                          Clique para anexar arquivo (Max 2MB)
                        </span>
                      </div>
                    ) : (
                      <div className="border border-white/10 rounded px-3 py-3 bg-white/[0.02] flex items-center justify-between gap-3 transition-all">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Paperclip className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-[10px] font-mono uppercase text-white/70 truncate">
                            {receiptFileName || "comprovante_carregado"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFixedReceipt("");
                            setReceiptFileName("");
                          }}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-mono uppercase rounded transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full mt-4 py-2.5 bg-white text-black font-headline font-bold text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
                  >
                    Cadastrar Conta
                  </button>

                </form>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-white/50 leading-relaxed uppercase">
                  Contas marcadas como &quot;Ambos&quot; dividem o valor em 50% para cada um. No início de cada mês, utilize o botão &quot;Novo Ciclo&quot; para resetar os status de quitados.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Receipt Preview Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            {/* Backdrop click to close */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceipt(null)}
              className="absolute inset-0"
            />
            {/* Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-3xl bg-[#0d0d10]/95 border border-white/10 rounded-xl shadow-2xl p-6 flex flex-col gap-4 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-headline font-bold text-sm tracking-wider text-white uppercase truncate max-w-[200px] sm:max-w-md">
                    Comprovante: {selectedReceipt.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 rounded text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                {selectedReceipt.url.startsWith("data:application/pdf") ? (
                  <div className="w-full flex flex-col items-center justify-center gap-4 py-8">
                    <FileText className="w-16 h-16 text-white/20" />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Arquivo de Documento PDF</span>
                    <a
                      href={selectedReceipt.url}
                      download={`comprovante-${selectedReceipt.title.replace(/\s+/g, "_").toLowerCase()}.pdf`}
                      className="px-5 py-2.5 bg-white text-black font-semibold font-headline text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300 flex items-center gap-2"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      Baixar / Ver PDF Completo
                    </a>
                    {/* Embedded preview for desktops */}
                    <div className="hidden sm:block w-full h-[50vh] border border-white/5 mt-4 rounded-lg overflow-hidden">
                      <iframe 
                        src={selectedReceipt.url} 
                        className="w-full h-full bg-black/40" 
                        title="Visualizador PDF"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-h-[70vh] flex items-center justify-center overflow-auto rounded-lg border border-white/5 bg-black/40 p-2">
                    <img 
                      src={selectedReceipt.url} 
                      alt="Comprovante de Conta" 
                      className="max-w-full max-h-[60vh] object-contain rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <a
                  href={selectedReceipt.url}
                  download={selectedReceipt.url.startsWith("data:application/pdf") 
                    ? `comprovante-${selectedReceipt.title.replace(/\s+/g, "_").toLowerCase()}.pdf`
                    : `comprovante-${selectedReceipt.title.replace(/\s+/g, "_").toLowerCase()}.jpg`}
                  className="px-4 py-2 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-mono text-[10px] tracking-wider rounded uppercase transition-colors"
                >
                  Download Direto
                </a>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 bg-white text-black font-semibold font-headline text-[10px] tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
