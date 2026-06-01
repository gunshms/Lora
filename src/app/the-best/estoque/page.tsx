"use client";

import React, { useState } from "react";
import { useAdega } from "@/context/AdegaContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wine, 
  Beer,
  Plus, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  ShoppingBag, 
  AlertCircle, 
  HelpCircle, 
  X,
  DollarSign
} from "lucide-react";
import Image from "next/image";

export default function EstoquePage() {
  const { 
    stock, 
    addStock, 
    adjustStockQty, 
    toggleStockStatus, 
    deleteStock 
  } = useAdega();

  const [isAddingStock, setIsAddingStock] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Form inputs
  const [stockName, setStockName] = useState("");
  const [stockQty, setStockQty] = useState(1);
  const [stockStatus, setStockStatus] = useState<"urgent" | "planned" | "in_stock">("planned");
  const [priceCost, setPriceCost] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [barcode, setBarcode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName.trim() || stockQty <= 0) return;

    const success = await addStock(stockName, stockQty, stockStatus, priceCost, priceSell, barcode);
    if (success) {
      setStockName("");
      setStockQty(1);
      setStockStatus("planned");
      setPriceCost("");
      setPriceSell("");
      setBarcode("");
      setIsAddingStock(false);
    }
  };

  const statusConfigs = {
    urgent: {
      label: "Urgente",
      styles: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-550/20",
    },
    planned: {
      label: "Planejado",
      styles: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-550/20",
    },
    in_stock: {
      label: "Em Estoque",
      styles: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-550/20",
    },
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-mono uppercase text-white/40 tracking-[0.2em]">Adega & Suprimentos</span>
          <h2 className="font-headline text-3xl font-black tracking-widest text-white mt-1 uppercase">
            ESTOQUE & COMPRAS
          </h2>
        </div>

        <button 
          onClick={() => setIsAddingStock(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold font-headline text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Adicionar Item
        </button>
      </div>

      {/* Info Warning Bar */}
      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-white/60 font-mono uppercase">
          <HelpCircle className="w-4 h-4 text-white/40" />
          Dica: Defina os preços de custo e venda dos itens para que eles fiquem prontos no PDV.
        </div>

        <div className="flex gap-4 font-mono text-[10px] uppercase text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Urgente</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Planejado</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Em Estoque</span>
        </div>
      </div>

      {/* Stock Cards Grid */}
      {stock.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stock.map((item) => {
            const config = statusConfigs[item.status] || statusConfigs.planned;
            return (
              <div 
                key={item.id} 
                className="bg-[#0b0b0d] border border-white/5 rounded-xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[190px] hover:border-white/10 transition-all duration-300"
              >
                {/* Decorative Wave Background Watermark */}
                <div className="absolute right-[-10px] bottom-[-10px] w-24 h-24 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 select-none">
                  <Image 
                    src="/adega/crest_white.png" 
                    alt="Wave watermark" 
                    width={96} 
                    height={96} 
                    className="object-contain invert"
                  />
                </div>

                {/* Card Top: Title & Status */}
                <div className="space-y-4 relative z-10 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-white/[0.02] border border-white/5 text-amber-400">
                        <Beer className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-base text-white/95 leading-tight tracking-wide group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                    </div>

                    <button 
                      onClick={() => toggleStockStatus(item.id)}
                      className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded border font-semibold transition-all duration-300 ${config.styles}`}
                      title="Clique para mudar status"
                    >
                      {config.label}
                    </button>
                  </div>

                  {/* Pricing info */}
                  <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-white/5 text-[11px] font-mono uppercase text-white/40">
                    <div>
                      <span>Preço Custo</span>
                      <span className="block text-white font-bold mt-0.5">{formatCurrency(item.price_cost)}</span>
                    </div>
                    <div>
                      <span>Preço Venda</span>
                      <span className="block text-emerald-400 font-bold mt-0.5">{formatCurrency(item.price_sell)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Quantity adjustments & delete */}
                <div className="flex items-center justify-between pt-4 mt-4 relative z-10">
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => adjustStockQty(item.id, -1)}
                      className="p-1 rounded text-white/30 hover:text-white transition-colors"
                      title="Diminuir"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                    
                    <span className="font-mono text-xl font-bold text-white min-w-[24px] text-center">
                      {item.quantity}
                    </span>

                    <button 
                      onClick={() => adjustStockQty(item.id, 1)}
                      className="p-1 rounded text-white/30 hover:text-white transition-colors"
                      title="Aumentar"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button 
                    onClick={() => deleteStock(item.id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                    title="Excluir item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#0b0b0d] border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-3">
          <Wine className="w-10 h-10 text-white/20" />
          <p className="text-xs font-mono uppercase text-white/30 tracking-wider">
            Nenhum item cadastrado no estoque de bebidas.
          </p>
        </div>
      )}

      {/* Add Stock Sidebar Drawer */}
      <AnimatePresence>
        {isAddingStock && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end bg-black/60 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingStock(false)}
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
                    <ShoppingBag className="w-5 h-5 text-white/80" />
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white uppercase">ADICIONAR ITEM</h3>
                  </div>
                  <button 
                    onClick={() => setIsAddingStock(false)}
                    className="p-1 rounded text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Nome da Bebida / Produto</label>
                    <input 
                      type="text" 
                      required
                      value={stockName}
                      onChange={(e) => setStockName(e.target.value)}
                      placeholder="Ex: Cerveja Skol Litrão, Vodka Smirnoff, Carvão 5kg"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Preço de Custo (R$)</label>
                      <input 
                        type="text" 
                        value={priceCost}
                        onChange={(e) => setPriceCost(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Preço de Venda (R$)</label>
                      <input 
                        type="text" 
                        value={priceSell}
                        onChange={(e) => setPriceSell(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Código de Barras (Opcional)</label>
                    <input 
                      type="text" 
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="789..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Quantidade Inicial</label>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setStockQty(prev => Math.max(1, prev - 1))}
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/70"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={stockQty}
                        onChange={(e) => setStockQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-1.5 bg-black/40 border border-white/10 rounded text-center text-white text-sm font-mono focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setStockQty(prev => prev + 1)}
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/70"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block">Status de Compra / Estoque</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "urgent", label: "Urgente" },
                        { id: "planned", label: "Planejado" },
                        { id: "in_stock", label: "Em Estoque" },
                      ].map((statusOption) => (
                        <button 
                          key={statusOption.id}
                          type="button"
                          onClick={() => setStockStatus(statusOption.id as any)}
                          className={`py-2 px-3 rounded text-[10px] font-mono uppercase border transition-all duration-300 font-semibold ${
                            stockStatus === statusOption.id 
                              ? statusOption.id === "urgent" 
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30" 
                                : statusOption.id === "planned" 
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60"
                          }`}
                        >
                          {statusOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-4 py-2.5 bg-white text-black font-headline font-bold text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
                  >
                    Salvar no Estoque
                  </button>
                </form>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-white/50 leading-relaxed uppercase">
                  Preços definidos no estoque ficam automaticamente prontos para finalização rápida no caixa (PDV).
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
