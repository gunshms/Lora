"use client";

import React, { useState } from "react";
import { useAdega } from "@/context/AdegaContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Check, 
  Filter, 
  User, 
  PlusCircle, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  X,
  Paperclip,
  FileText
} from "lucide-react";

export default function CustosPage() {
  const { 
    costs, 
    addCost, 
    toggleCostPaid, 
    deleteCost, 
    isCloudMode 
  } = useAdega();

  // Filters
  const [costFilter, setCostFilter] = useState<"all" | "gu" | "melhor" | "pending">("all");
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Auto-fill from URL parameters (replenishment triggers)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const autoDesc = params.get("autoDesc");
      const autoVal = params.get("autoVal");
      if (autoDesc) {
        setCostDesc(autoDesc);
        if (autoVal && autoVal !== "0" && autoVal !== "undefined") {
          setCostVal(autoVal);
        }
        setIsAddingCost(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Form states
  const [costDesc, setCostDesc] = useState("");
  const [costVal, setCostVal] = useState("");
  const [costBuyer, setCostBuyer] = useState<"gu" | "melhor">("gu");
  const [costPaid, setCostPaid] = useState(false);
  const [costInstallments, setCostInstallments] = useState("1");
  const [costReceipt, setCostReceipt] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [selectedReceipt, setSelectedReceipt] = useState<{ title: string; url: string } | null>(null);

  // Calculations
  const totalGeral = costs.reduce((sum, item) => sum + item.amount, 0);
  const totalGu = costs.reduce((sum, item) => sum + (item.buyer === "gu" ? item.amount : 0), 0);
  const totalMelhor = costs.reduce((sum, item) => sum + (item.buyer === "melhor" ? item.amount : 0), 0);

  const totalGuPago = costs.reduce((sum, item) => sum + (item.buyer === "gu" && item.paid ? item.amount : 0), 0);
  const totalMelhorPago = costs.reduce((sum, item) => sum + (item.buyer === "melhor" && item.paid ? item.amount : 0), 0);

  const totalItensPagos = costs.filter(c => c.paid).reduce((sum, c) => sum + c.amount, 0);
  const quotaAcerto = totalItensPagos / 2;
  const saldoAcerto = Math.abs(totalGuPago - totalMelhorPago) / 2;
  const credor = totalGuPago > totalMelhorPago ? "Gu" : totalMelhorPago > totalGuPago ? "Melhor" : null;

  const filteredCosts = costs.filter((c) => {
    if (costFilter === "gu") return c.buyer === "gu";
    if (costFilter === "melhor") return c.buyer === "melhor";
    if (costFilter === "pending") return !c.paid;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costDesc.trim() || !costVal) return;

    const success = await addCost(costDesc, costVal, costBuyer, costPaid, costInstallments, costReceipt);
    if (success) {
      setCostDesc("");
      setCostVal("");
      setCostBuyer("gu");
      setCostPaid(false);
      setCostInstallments("1");
      setCostReceipt("");
      setReceiptFileName("");
      setIsAddingCost(false);
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
        setCostReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
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
          <span className="text-xs font-mono uppercase text-white/40 tracking-[0.2em]">Finanças e Divisão</span>
          <h2 className="font-headline text-3xl font-black tracking-widest text-white mt-1 uppercase">
            CUSTOS & RATEIO
          </h2>
        </div>

        <button 
          onClick={() => setIsAddingCost(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold font-headline text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Lançar Custo
        </button>
      </div>

      {/* Mini financial report */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0b0b0d] border border-white/5 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Total Acumulado</span>
          <span className="text-xl font-headline font-bold text-white tracking-wide mt-2">{formatCurrency(totalGeral)}</span>
        </div>
        <div className="bg-[#0b0b0d] border border-white/5 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Investido por Gu</span>
          <span className="text-xl font-headline font-bold text-white/80 tracking-wide mt-2">
            {formatCurrency(totalGu)} <span className="text-[9px] text-white/40 font-mono">({formatCurrency(totalGuPago)} Pago)</span>
          </span>
        </div>
        <div className="bg-[#0b0b0d] border border-white/5 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Investido por Melhor</span>
          <span className="text-xl font-headline font-bold text-white/80 tracking-wide mt-2">
            {formatCurrency(totalMelhor)} <span className="text-[9px] text-white/40 font-mono">({formatCurrency(totalMelhorPago)} Pago)</span>
          </span>
        </div>
        <div className="bg-white/[0.02] border border-white/10 p-4 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider">Saldo de Acerto</span>
          {credor ? (
            <span className="text-sm font-headline font-semibold text-white mt-2 leading-snug">
              <span className="text-emerald-400 font-bold">{credor}</span> recebe <span className="text-base text-white font-bold">{formatCurrency(saldoAcerto)}</span>
            </span>
          ) : (
            <span className="text-xs font-headline font-semibold text-white/60 mt-2 uppercase tracking-wider">Contas Iguais</span>
          )}
        </div>
      </div>

      {/* Filter and View Panel */}
      <div className="bg-[#0b0b0d] border border-white/5 rounded-xl overflow-hidden">
        
        {/* Table Controls */}
        <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-xs font-mono uppercase text-white/50 tracking-wider">Filtros</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Todos" },
              { id: "gu", label: "Só Gu" },
              { id: "melhor", label: "Só Melhor" },
              { id: "pending", label: "Pendentes" },
            ].map((f) => (
              <button 
                key={f.id}
                onClick={() => setCostFilter(f.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all duration-300 ${
                  costFilter === f.id 
                    ? "bg-white text-black font-semibold" 
                    : "bg-white/[0.02] border border-white/5 text-white/60 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table / List */}
        <div>
          {filteredCosts.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-mono text-white/40 uppercase tracking-widest bg-white/[0.005]">
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Comprador</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredCosts.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4 font-medium text-white/90">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                            <span className="flex items-center gap-2">
                              {c.description}
                              {c.receipt && (
                                <button
                                  onClick={() => setSelectedReceipt({ title: c.description, url: c.receipt! })}
                                  className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-colors"
                                  title="Ver comprovante anexado"
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </span>
                            {c.installments_count && c.current_installment && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
                                Parcela {c.current_installment}/{c.installments_count}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border ${
                            c.buyer === "gu" 
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}>
                            <User className="w-2.5 h-2.5" />
                            {c.buyer}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-white">{formatCurrency(c.amount)}</td>
                        <td className="px-6 py-4 text-xs font-mono text-white/40">{c.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => toggleCostPaid(c.id)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono tracking-wider uppercase border transition-all duration-300 ${
                                c.paid 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-550/15" 
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-550/15"
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 ${c.paid ? "opacity-100" : "opacity-30"}`} />
                              {c.paid ? "Pago" : "Pendente"}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => deleteCost(c.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all duration-300"
                            title="Deletar custo"
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
                {filteredCosts.map((c) => (
                  <div key={c.id} className="p-5 space-y-4 hover:bg-white/[0.005] transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-medium text-white text-sm leading-snug">{c.description}</h4>
                          {c.installments_count && c.current_installment && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Parcela {c.current_installment}/{c.installments_count}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-white/40 uppercase block">{c.date}</span>
                      </div>
                      <span className="text-base font-mono font-bold text-white whitespace-nowrap">
                        {formatCurrency(c.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase border ${
                          c.buyer === "gu" 
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}>
                          <User className="w-2.5 h-2.5" />
                          {c.buyer}
                        </span>
                        {c.receipt && (
                          <button
                            onClick={() => setSelectedReceipt({ title: c.description, url: c.receipt! })}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 transition-all"
                          >
                            <Paperclip className="w-2.5 h-2.5" />
                            Comprovante
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleCostPaid(c.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-mono tracking-wider uppercase border transition-all duration-300 ${
                            c.paid 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {c.paid ? "Pago" : "Pendente"}
                        </button>

                        <button 
                          onClick={() => deleteCost(c.id)}
                          className="p-2.5 rounded-md bg-white/[0.02] border border-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                          title="Deletar custo"
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
              Nenhum item corresponde ao filtro selecionado.
            </div>
          )}
        </div>
      </div>

      {/* Add Cost Slide-Over / Modal */}
      <AnimatePresence>
        {isAddingCost && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end bg-black/60 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingCost(false)}
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
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white uppercase">LANÇAR NOVO CUSTO</h3>
                  </div>
                  <button 
                    onClick={() => setIsAddingCost(false)}
                    className="p-1 rounded text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Descrição do Item</label>
                    <input 
                      type="text" 
                      required
                      value={costDesc}
                      onChange={(e) => setCostDesc(e.target.value)}
                      placeholder="Ex: Armário de Madeira, Adega Climatizada"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Valor (R$)</label>
                    <input 
                      type="text" 
                      required
                      value={costVal}
                      onChange={(e) => setCostVal(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider font-semibold block">Número de Parcelas</label>
                    <input 
                      type="number" 
                      min="1"
                      max="72"
                      value={costInstallments}
                      onChange={(e) => setCostInstallments(e.target.value)}
                      placeholder="1 (À vista)"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm font-mono"
                    />
                    <span className="text-[9px] font-mono text-white/30 uppercase block">Defina maior que 1 para despesas parceladas mensais</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block">Quem Comprou / Pagou?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setCostBuyer("gu")}
                        className={`py-2 px-4 rounded text-xs font-mono uppercase border transition-all duration-300 ${
                          costBuyer === "gu" 
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30 font-bold" 
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"
                        }`}
                      >
                        Gu
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCostBuyer("melhor")}
                        className={`py-2 px-4 rounded text-xs font-mono uppercase border transition-all duration-300 ${
                          costBuyer === "melhor" 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold" 
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"
                        }`}
                      >
                        Melhor
                      </button>
                    </div>
                  </div>

                  {/* Comprovante */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block">Comprovante (Imagem ou PDF)</label>
                    {!costReceipt ? (
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
                            setCostReceipt("");
                            setReceiptFileName("");
                          }}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-mono uppercase rounded transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input 
                      type="checkbox"
                      id="costPaidCheck"
                      checked={costPaid}
                      onChange={(e) => setCostPaid(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-black/40 checked:bg-white text-black"
                    />
                    <label htmlFor="costPaidCheck" className="text-xs font-mono uppercase text-white/70 tracking-wider cursor-pointer select-none">
                      Marcar despesa como já paga
                    </label>
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-4 py-2.5 bg-white text-black font-headline font-bold text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
                  >
                    Adicionar Custo
                  </button>
                </form>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-white/50 leading-relaxed uppercase">
                  O valor será rateado igualmente (50/50). O balanço de acerto será atualizado automaticamente assim que o item for marcado como pago.
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
                      alt="Comprovante de Custo" 
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
