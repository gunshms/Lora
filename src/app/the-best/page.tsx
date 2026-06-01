"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Check, 
  ShoppingBag, 
  Lightbulb, 
  DollarSign, 
  PlusCircle, 
  MinusCircle, 
  Wine, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  X,
  Settings,
  Database,
  RefreshCw,
  Cloud,
  CloudOff,
  Copy
} from "lucide-react";
import clsx from "clsx";
import { getSupabaseClient, SupabaseConfig } from "@/services/supabase";

// Types matching the schema
interface CostItem {
  id: string;
  description: string;
  amount: number;
  buyer: "gu" | "melhor";
  paid: boolean;
  date: string;
}

interface IdeaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  color: "burgundy" | "gold" | "sage" | "terracotta" | "charcoal";
  date: string;
}

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  status: "urgent" | "planned" | "in_stock";
}

export default function AdegaTheBest() {
  const [mounted, setMounted] = useState(false);

  // Database Connection State (STRICTLY REQUIRED)
  const [dbConfig, setDbConfig] = useState<SupabaseConfig | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings inputs
  const [inputUrl, setInputUrl] = useState("");
  const [inputKey, setInputKey] = useState("");

  // Core Data States
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Filtering / UI States
  const [costFilter, setCostFilter] = useState<"all" | "gu" | "melhor" | "pending">("all");
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [isAddingStock, setIsAddingStock] = useState(false);

  // Cost Form Inputs
  const [costDesc, setCostDesc] = useState("");
  const [costVal, setCostVal] = useState("");
  const [costBuyer, setCostBuyer] = useState<"gu" | "melhor">("gu");
  const [costPaid, setCostPaid] = useState(false);

  // Idea Form Inputs
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDesc, setIdeaDesc] = useState("");
  const [ideaCat, setIdeaCat] = useState("Decoração");
  const [ideaColor, setIdeaColor] = useState<IdeaItem["color"]>("gold");

  // Stock Form Inputs
  const [stockName, setStockName] = useState("");
  const [stockQty, setStockQty] = useState(1);
  const [stockStatus, setStockStatus] = useState<StockItem["status"]>("planned");

  // Load configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("thebest_db_config");
    let activeConfig: SupabaseConfig | null = null;
    
    if (savedConfig) {
      activeConfig = JSON.parse(savedConfig);
      setDbConfig(activeConfig);
      if (activeConfig) {
        setInputUrl(activeConfig.url);
        setInputKey(activeConfig.anonKey);
      }
    } else {
      // Check process.env variables as fallback
      const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (envUrl && envKey) {
        activeConfig = { url: envUrl, anonKey: envKey };
        setDbConfig(activeConfig);
        setInputUrl(envUrl);
        setInputKey(envKey);
      }
    }

    if (activeConfig) {
      initializeCloudData(activeConfig);
    } else {
      setMounted(true);
    }
  }, []);

  // Fetch all tables from Supabase strictly
  const initializeCloudData = async (config: SupabaseConfig) => {
    setIsLoadingData(true);
    setDbError(null);
    const client = getSupabaseClient(config);

    if (client) {
      try {
        const [costsRes, ideasRes, stockRes] = await Promise.all([
          client.from("thebest_costs").select("*").order("date", { ascending: false }),
          client.from("thebest_ideas").select("*").order("date", { ascending: false }),
          client.from("thebest_stock").select("*"),
        ]);

        if (costsRes.error) throw new Error(`Erro na tabela de custos: ${costsRes.error.message}`);
        if (ideasRes.error) throw new Error(`Erro na tabela de ideias: ${ideasRes.error.message}`);
        if (stockRes.error) throw new Error(`Erro na tabela de estoque: ${stockRes.error.message}`);

        // Successfully loaded from Cloud!
        setCosts(costsRes.data || []);
        setIdeas(ideasRes.data || []);
        setStock(stockRes.data || []);
        setIsCloudMode(true);
      } catch (err: any) {
        console.error("Supabase load error:", err);
        setDbError(err.message || "Falha ao consultar tabelas na nuvem.");
        setIsCloudMode(false);
      } finally {
        setIsLoadingData(false);
        setMounted(true);
      }
    } else {
      setIsCloudMode(false);
      setIsLoadingData(false);
      setMounted(true);
    }
  };

  // Connect and test Supabase connection
  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) {
      setDbError("Por favor, preencha a URL e a Chave Anon.");
      return;
    }

    setIsTestingConfig(true);
    setDbError(null);

    const testConfig = { url: inputUrl.trim(), anonKey: inputKey.trim() };
    const client = getSupabaseClient(testConfig);

    if (!client) {
      setDbError("URL ou Chave inválidas.");
      setIsTestingConfig(false);
      return;
    }

    try {
      // Test querying the costs table to check schema validity
      const { error } = await client.from("thebest_costs").select("id").limit(1);
      
      if (error) {
        throw new Error(`Conexão OK, mas tabelas não encontradas: ${error.message}. Certifique-se de executar o SQL abaixo para criar as tabelas no Supabase.`);
      }

      // Successful connection!
      localStorage.setItem("thebest_db_config", JSON.stringify(testConfig));
      setDbConfig(testConfig);
      await initializeCloudData(testConfig);
      setShowSettingsModal(false);
    } catch (err: any) {
      setDbError(err.message || "Erro ao conectar ao Supabase.");
      setIsCloudMode(false);
    } finally {
      setIsTestingConfig(false);
    }
  };

  // Disconnect / Logout Database
  const handleDisconnect = () => {
    localStorage.removeItem("thebest_db_config");
    setDbConfig(null);
    setInputUrl("");
    setInputKey("");
    setIsCloudMode(false);
    setDbError(null);
    setCosts([]);
    setIdeas([]);
    setStock([]);
  };

  // Cost Actions
  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costDesc.trim() || !costVal || !isCloudMode) return;

    const parsedVal = parseFloat(costVal.replace(",", "."));
    if (isNaN(parsedVal) || parsedVal <= 0) return;

    const newCost: CostItem = {
      id: `c-${Date.now()}`,
      description: costDesc.trim(),
      amount: parsedVal,
      buyer: costBuyer,
      paid: costPaid,
      date: new Date().toISOString().split("T")[0],
    };

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client.from("thebest_costs").insert(newCost);
    if (error) {
      alert(`Erro ao salvar na nuvem: ${error.message}`);
      return;
    }

    setCosts((prev) => [newCost, ...prev]);
    
    // Reset Form
    setCostDesc("");
    setCostVal("");
    setCostBuyer("gu");
    setCostPaid(false);
    setIsAddingCost(false);
  };

  const handleToggleCostPaid = async (id: string) => {
    if (!isCloudMode) return;
    const targetItem = costs.find((c) => c.id === id);
    if (!targetItem) return;

    const updatedPaid = !targetItem.paid;

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client
      .from("thebest_costs")
      .update({ paid: updatedPaid })
      .eq("id", id);
    
    if (error) {
      alert(`Erro ao atualizar na nuvem: ${error.message}`);
      return;
    }

    setCosts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, paid: updatedPaid } : c))
    );
  };

  const handleDeleteCost = async (id: string) => {
    if (!isCloudMode) return;

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client.from("thebest_costs").delete().eq("id", id);
    if (error) {
      alert(`Erro ao deletar na nuvem: ${error.message}`);
      return;
    }

    setCosts((prev) => prev.filter((c) => c.id !== id));
  };

  // Idea Actions
  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaDesc.trim() || !isCloudMode) return;

    const newIdea: IdeaItem = {
      id: `i-${Date.now()}`,
      title: ideaTitle.trim(),
      description: ideaDesc.trim(),
      category: ideaCat,
      color: ideaColor,
      date: new Date().toISOString().split("T")[0],
    };

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client.from("thebest_ideas").insert(newIdea);
    if (error) {
      alert(`Erro ao salvar ideia na nuvem: ${error.message}`);
      return;
    }

    setIdeas((prev) => [newIdea, ...prev]);

    // Reset Form
    setIdeaTitle("");
    setIdeaDesc("");
    setIdeaCat("Decoração");
    setIdeaColor("gold");
    setIsAddingIdea(false);
  };

  const handleDeleteIdea = async (id: string) => {
    if (!isCloudMode) return;

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client.from("thebest_ideas").delete().eq("id", id);
    if (error) {
      alert(`Erro ao deletar ideia na nuvem: ${error.message}`);
      return;
    }

    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  // Stock Actions
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName.trim() || stockQty <= 0 || !isCloudMode) return;

    const newStock: StockItem = {
      id: `s-${Date.now()}`,
      name: stockName.trim(),
      quantity: stockQty,
      status: stockStatus,
    };

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client.from("thebest_stock").insert(newStock);
    if (error) {
      alert(`Erro ao salvar estoque na nuvem: ${error.message}`);
      return;
    }

    setStock((prev) => [newStock, ...prev]);

    // Reset Form
    setStockName("");
    setStockQty(1);
    setStockStatus("planned");
    setIsAddingStock(false);
  };

  const handleAdjustStockQty = async (id: string, amount: number) => {
    if (!isCloudMode) return;
    const item = stock.find((s) => s.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + amount);

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client
      .from("thebest_stock")
      .update({ quantity: newQty })
      .eq("id", id);
    
    if (error) {
      alert(`Erro ao atualizar quantidade na nuvem: ${error.message}`);
      return;
    }

    setStock((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantity: newQty } : s))
    );
  };

  const handleToggleStockStatus = async (id: string) => {
    if (!isCloudMode) return;
    const item = stock.find((s) => s.id === id);
    if (!item) return;

    const cycle: Record<StockItem["status"], StockItem["status"]> = {
      urgent: "planned",
      planned: "in_stock",
      in_stock: "urgent",
    };
    const nextStatus = cycle[item.status];

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client
      .from("thebest_stock")
      .update({ status: nextStatus })
      .eq("id", id);
    
    if (error) {
      alert(`Erro ao atualizar status na nuvem: ${error.message}`);
      return;
    }

    setStock((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
  };

  const handleDeleteStock = async (id: string) => {
    if (!isCloudMode) return;

    const client = getSupabaseClient(dbConfig);
    if (!client) return;

    const { error } = await client.from("thebest_stock").delete().eq("id", id);
    if (error) {
      alert(`Erro ao deletar item de estoque na nuvem: ${error.message}`);
      return;
    }

    setStock((prev) => prev.filter((s) => s.id !== id));
  };

  // Calculations
  const totalGeral = costs.reduce((sum, item) => sum + item.amount, 0);
  const totalGu = costs.reduce((sum, item) => sum + (item.buyer === "gu" ? item.amount : 0), 0);
  const totalMelhor = costs.reduce((sum, item) => sum + (item.buyer === "melhor" ? item.amount : 0), 0);

  const totalGuPago = costs.reduce((sum, item) => sum + (item.buyer === "gu" && item.paid ? item.amount : 0), 0);
  const totalMelhorPago = costs.reduce((sum, item) => sum + (item.buyer === "melhor" && item.paid ? item.amount : 0), 0);

  const filteredCosts = costs.filter((c) => {
    if (costFilter === "gu") return c.buyer === "gu";
    if (costFilter === "melhor") return c.buyer === "melhor";
    if (costFilter === "pending") return !c.paid;
    return true;
  });

  const sqlCreateScripts = `-- 1. Tabela de Custos
create table thebest_costs (
  id text primary key,
  description text not null,
  amount numeric not null,
  buyer text not null,
  paid boolean default false,
  date date default current_date
);

-- 2. Tabela de Ideias
create table thebest_ideas (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  color text not null,
  date date default current_date
);

-- 3. Tabela de Estoque / Compras
create table thebest_stock (
  id text primary key,
  name text not null,
  quantity integer not null,
  status text not null
);`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Código SQL copiado! Cole no SQL Editor do Supabase.");
  };

  // Loading skeleton placeholder before hydration
  if (!mounted) {
    return (
      <main className="w-full min-h-screen bg-[#070405] text-[#F2F0E9] flex flex-col justify-center items-center font-body p-6">
        <div className="flex flex-col items-center gap-4">
          <Wine className="w-16 h-16 text-[#D4AF37] animate-pulse" />
          <h2 className="text-xl font-headline tracking-widest text-[#D4AF37] uppercase">Carregando The Best...</h2>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-[#D4AF37] rounded-full animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // GATEWAY MODE: Show strictly if Supabase cloud connection is not established
  if (!isCloudMode) {
    return (
      <main className="relative w-full min-h-screen bg-gradient-to-br from-[#0A0607] via-[#090506] to-[#0E090B] text-[#F2F0E9] font-body flex items-center justify-center p-4 overflow-hidden">
        {/* Decorative Blur Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#5C0612]/15 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#D4AF37]/5 blur-[150px] pointer-events-none z-0" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-xl w-full glass-panel rounded-3xl p-8 border-[#D4AF37]/20 bg-gradient-to-b from-[#180F12] to-[#0A0607] shadow-[0_0_60px_rgba(92,6,18,0.4)] flex flex-col gap-6"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-4 bg-[#5C0612]/20 border border-[#D4AF37]/30 rounded-full mb-2">
              <Wine className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl font-headline uppercase font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#F2F0E9] via-[#EAC154] to-[#D4AF37]">
              THE BEST • ADEGA
            </h1>
            <p className="text-xs uppercase tracking-widest text-white/40 font-body">Configuração do Banco Online</p>
          </div>

          <div className="p-4 rounded-xl bg-[#5C0612]/15 border border-[#5C0612]/30 text-[#F2F0E9]/80 text-xs leading-relaxed flex flex-col gap-2">
            <div className="flex gap-2 items-start font-semibold text-white uppercase tracking-wider font-headline text-xs">
              <Database className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>Sincronização Compartilhada Ativa</span>
            </div>
            <p className="text-xs text-white/60">
              Para que **Gu** e **Melhor** possam visualizar, gerenciar e atualizar os custos, estoque e mural juntos de qualquer aparelho em tempo real, o aplicativo opera **estritamente online**.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveConnection} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/40 tracking-wider">Supabase URL</label>
              <input 
                type="url" 
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://xxxxxx.supabase.co"
                className="bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5 font-mono">
              <label className="text-[10px] uppercase text-white/40 tracking-wider font-body">Supabase Anon Public Key</label>
              <input 
                type="password" 
                required
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all font-mono"
              />
            </div>

            {dbError && (
              <div className="p-3 bg-red-950/25 border border-red-500/25 rounded-xl text-red-400 text-xs flex gap-2 items-start leading-relaxed font-body">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{dbError}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isTestingConfig}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#EAC154] text-black font-headline uppercase tracking-wider font-bold text-xs hover:brightness-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isTestingConfig ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Conectando e Validando...
                </>
              ) : (
                "Entrar no Dashboard Online"
              )}
            </button>
          </form>

          {/* SQL Setup Help */}
          <div className="border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={() => setShowSqlHelp(!showSqlHelp)}
              className="flex items-center justify-between w-full text-xs font-headline uppercase tracking-wider text-[#D4AF37] font-semibold hover:text-white transition-colors cursor-pointer"
            >
              <span>1. Clique para ver o SQL de Criação das Tabelas</span>
              <span>{showSqlHelp ? "Recolher" : "Expandir"}</span>
            </button>
            
            {showSqlHelp && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-[9.5px] text-white/40 leading-relaxed font-body">
                  Antes de conectar, abra o console do seu Supabase gratuito, vá em **SQL Editor** &gt; **New Query**, cole o código abaixo e clique em **RUN**.
                </p>
                <div className="relative">
                  <pre className="bg-black/55 text-emerald-400 p-3 rounded-lg text-[9px] font-mono overflow-x-auto max-h-[150px] border border-white/5 select-all">
                    {sqlCreateScripts}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(sqlCreateScripts)}
                    type="button"
                    className="absolute top-2 right-2 p-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[#D4AF37] cursor-pointer"
                    title="Copiar Código SQL"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    );
  }

  // ACTIVE DASHBOARD MODE: Strictly synchronized online
  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-[#0A0607] via-[#090506] to-[#0E090B] text-[#F2F0E9] font-body pb-24 overflow-x-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#5C0612]/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#D4AF37]/5 blur-[150px] pointer-events-none z-0" />

      {/* Elegant Header */}
      <header className="relative w-full py-12 px-4 md:px-12 z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#5C0612]/20 border border-[#D4AF37]/30 rounded-xl">
                <Wine className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#F2F0E9] via-[#EAC154] to-[#D4AF37]">
                    THE BEST
                  </h1>
                  
                  {/* Cloud Mode Badge */}
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-headline uppercase tracking-widest border font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                    <Cloud size={9} />
                    Sincronizado
                  </span>
                </div>
                <p className="text-[10px] tracking-[0.4em] text-white/40 uppercase font-body">Adega Privada & Gestão</p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats & Controls */}
          <div className="flex gap-4 items-center flex-wrap justify-center">
            
            {/* Cloud Setup Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-3 rounded-xl border bg-emerald-950/15 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-headline uppercase tracking-wider font-semibold"
              title="Configurações de Conexão"
            >
              <Settings size={16} />
              <span>Configurações</span>
            </button>

            <div className="glass-panel px-6 py-3 rounded-2xl flex flex-col items-center md:items-end border-[#D4AF37]/10">
              <span className="text-[9px] uppercase tracking-widest text-white/30 font-body">Investimento Total</span>
              <span className="text-xl md:text-2xl font-headline text-[#EAC154] font-semibold mt-1">
                R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Costs & Financials (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Financial Cards Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* GU CARD */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-[#D4AF37]/15 group hover:border-[#D4AF37]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-white/40 font-body">Custo Acumulado</span>
                  <h3 className="text-2xl font-headline text-[#EAC154] font-bold mt-1">Gu</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#EAC154] font-headline uppercase tracking-widest">
                  Parceiro
                </span>
              </div>
              <div className="mt-6 flex flex-col">
                <span className="text-2xl font-headline font-bold text-white">
                  R$ {totalGu.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="flex justify-between items-center mt-2 text-xs text-white/50 border-t border-white/5 pt-2">
                  <span>Pago: R$ {totalGuPago.toLocaleString("pt-BR")}</span>
                  <span className="text-[#EAC154]/80">Pendente: R$ {(totalGu - totalGuPago).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>

            {/* MELHOR CARD */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-[#5C0612]/30 group hover:border-[#5C0612]/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#5C0612]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-white/40 font-body">Custo Acumulado</span>
                  <h3 className="text-2xl font-headline text-red-400 font-bold mt-1">Melhor</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#5C0612]/20 border border-[#5C0612]/40 text-red-300 font-headline uppercase tracking-widest">
                  Líder
                </span>
              </div>
              <div className="mt-6 flex flex-col">
                <span className="text-2xl font-headline font-bold text-white">
                  R$ {totalMelhor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="flex justify-between items-center mt-2 text-xs text-white/50 border-t border-white/5 pt-2">
                  <span>Pago: R$ {totalMelhorPago.toLocaleString("pt-BR")}</span>
                  <span className="text-red-400/80">Pendente: R$ {(totalMelhor - totalMelhorPago).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Cost Manager Box */}
          <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-headline uppercase tracking-widest font-semibold text-white">Custos Lançados</h2>
              </div>
              <button 
                onClick={() => setIsAddingCost(!isAddingCost)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5C0612]/30 border border-[#5C0612]/50 hover:bg-[#5C0612]/50 hover:text-white transition-all text-xs font-headline uppercase tracking-wider text-red-300 cursor-pointer"
              >
                {isAddingCost ? <X size={14} /> : <Plus size={14} />}
                {isAddingCost ? "Fechar" : "Lançar Custo"}
              </button>
            </div>

            {/* Expandable Form */}
            <AnimatePresence>
              {isAddingCost && (
                <motion.form 
                  onSubmit={handleAddCost}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
                >
                  <h3 className="text-sm font-headline uppercase tracking-wider text-[#D4AF37]">Novo Custo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase text-white/40 tracking-wider">Descrição / Item</label>
                      <input 
                        type="text" 
                        required
                        value={costDesc}
                        onChange={(e) => setCostDesc(e.target.value)}
                        placeholder="Ex: Climatização, Madeiramento..."
                        className="bg-black/35 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase text-white/40 tracking-wider">Valor (R$)</label>
                      <input 
                        type="text" 
                        required
                        value={costVal}
                        onChange={(e) => setCostVal(e.target.value)}
                        placeholder="Ex: 450,00"
                        className="bg-black/35 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase text-white/40 tracking-wider">Responsável</label>
                      <div className="flex rounded-xl overflow-hidden border border-white/10 p-0.5 bg-black/25">
                        <button
                          type="button"
                          onClick={() => setCostBuyer("gu")}
                          className={clsx(
                            "flex-1 text-center py-2 text-xs font-headline uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                            costBuyer === "gu" ? "bg-[#D4AF37] text-black font-semibold" : "text-white/60 hover:text-white"
                          )}
                        >
                          Gu
                        </button>
                        <button
                          type="button"
                          onClick={() => setCostBuyer("melhor")}
                          className={clsx(
                            "flex-1 text-center py-2 text-xs font-headline uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                            costBuyer === "melhor" ? "bg-[#5C0612] text-white font-semibold" : "text-white/60 hover:text-white"
                          )}
                        >
                          Melhor
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 md:pt-0">
                      <button
                        type="button"
                        onClick={() => setCostPaid(!costPaid)}
                        className={clsx(
                          "w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer",
                          costPaid ? "bg-emerald-500 border-emerald-500 text-black" : "border-white/20 bg-black/25"
                        )}
                      >
                        {costPaid && <Check size={14} />}
                      </button>
                      <span className="text-xs text-white/70 select-none cursor-pointer" onClick={() => setCostPaid(!costPaid)}>
                        Marcar como já pago
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <button 
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#EAC154] text-black font-headline uppercase tracking-wider font-semibold text-xs hover:brightness-110 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all cursor-pointer"
                    >
                      Adicionar Custo
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List Filter Controls */}
            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
              <button 
                onClick={() => setCostFilter("all")}
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-headline uppercase tracking-wider transition-all cursor-pointer",
                  costFilter === "all" ? "bg-white text-black font-semibold" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                Todos
              </button>
              <button 
                onClick={() => setCostFilter("gu")}
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-headline uppercase tracking-wider transition-all cursor-pointer",
                  costFilter === "gu" ? "bg-[#D4AF37]/20 text-[#EAC154] border border-[#D4AF37]/30" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                Só Gu
              </button>
              <button 
                onClick={() => setCostFilter("melhor")}
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-headline uppercase tracking-wider transition-all cursor-pointer",
                  costFilter === "melhor" ? "bg-[#5C0612]/30 text-red-300 border border-[#5C0612]/50" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                Só Melhor
              </button>
              <button 
                onClick={() => setCostFilter("pending")}
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-headline uppercase tracking-wider transition-all ml-auto cursor-pointer",
                  costFilter === "pending" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                Pendentes
              </button>
            </div>

            {/* Costs List */}
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredCosts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                  <HelpCircle className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/40">Nenhum custo cadastrado nesta categoria.</p>
                </div>
              ) : (
                filteredCosts.map((cost) => (
                  <div 
                    key={cost.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox button */}
                      <button 
                        onClick={() => handleToggleCostPaid(cost.id)}
                        className={clsx(
                          "w-5 h-5 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                          cost.paid 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                            : "border-white/20 hover:border-white/40"
                        )}
                        title={cost.paid ? "Marcar como pendente" : "Marcar como pago"}
                      >
                        {cost.paid && <Check size={12} />}
                      </button>

                      <div className="flex flex-col">
                        <span className={clsx(
                          "text-sm font-medium text-white/90",
                          cost.paid && "line-through text-white/40"
                        )}>
                          {cost.description}
                        </span>
                        <span className="text-[10px] text-white/30 mt-0.5">{cost.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Badge Buyer */}
                      <span className={clsx(
                        "text-[9px] font-headline uppercase tracking-widest px-2.5 py-0.5 rounded-full font-semibold border",
                        cost.buyer === "gu" 
                          ? "bg-[#D4AF37]/10 text-[#EAC154] border-[#D4AF37]/20" 
                          : "bg-[#5C0612]/20 text-red-300 border-[#5C0612]/35"
                      )}>
                        {cost.buyer === "gu" ? "Gu" : "Melhor"}
                      </span>

                      {/* Value and Delete */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-white font-headline">
                          R$ {cost.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        
                        <button 
                          onClick={() => handleDeleteCost(cost.id)}
                          className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          title="Remover custo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Ideas & Stock Control (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* STOCK CONTROL BOX */}
          <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-headline uppercase tracking-widest font-semibold text-white">Lista de Compras</h2>
              </div>
              <button 
                onClick={() => setIsAddingStock(!isAddingStock)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 hover:text-white transition-all text-xs font-headline uppercase tracking-wider text-[#D4AF37] cursor-pointer"
              >
                {isAddingStock ? <X size={12} /> : <Plus size={12} />}
                {isAddingStock ? "Fechar" : "Novo Item"}
              </button>
            </div>

            {/* Expandable Stock Form */}
            <AnimatePresence>
              {isAddingStock && (
                <motion.form 
                  onSubmit={handleAddStock}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase text-white/40 tracking-wider">Item a Comprar</label>
                    <input 
                      type="text" 
                      required
                      value={stockName}
                      onChange={(e) => setStockName(e.target.value)}
                      placeholder="Ex: Saca-rolhas, Taça Bordeaux..."
                      className="bg-black/35 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase text-white/40 tracking-wider">Qtd.</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={stockQty}
                        onChange={(e) => setStockQty(parseInt(e.target.value) || 1)}
                        className="bg-black/35 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase text-white/40 tracking-wider">Prioridade</label>
                      <select
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value as StockItem["status"])}
                        className="bg-black/35 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      >
                        <option value="urgent">Urgente</option>
                        <option value="planned">Planejado</option>
                        <option value="in_stock">Em Estoque</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-headline uppercase tracking-wider font-semibold text-[10px] hover:brightness-110 transition-all cursor-pointer"
                    >
                      Adicionar Item
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Stock List */}
            <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
              {stock.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  <p className="text-xs text-white/40">Nenhum item pendente de compra.</p>
                </div>
              ) : (
                stock.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Priority toggle */}
                      <button
                        onClick={() => handleToggleStockStatus(item.id)}
                        className="cursor-pointer"
                        title="Alterar status de prioridade"
                      >
                        {item.status === "urgent" && <AlertCircle className="w-4 h-4 text-red-400" />}
                        {item.status === "planned" && <HelpCircle className="w-4 h-4 text-amber-300" />}
                        {item.status === "in_stock" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </button>

                      <div className="flex flex-col">
                        <span className={clsx(
                          "text-xs font-medium text-white/80",
                          item.status === "in_stock" && "line-through text-white/40"
                        )}>
                          {item.name}
                        </span>
                        
                        {/* Status Label badge */}
                        <span className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">
                          {item.status === "urgent" && "Urgente"}
                          {item.status === "planned" && "Planejado"}
                          {item.status === "in_stock" && "Em Estoque"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {/* Qty incrementors */}
                      <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                        <button 
                          onClick={() => handleAdjustStockQty(item.id, -1)}
                          className="text-white/40 hover:text-white transition-colors cursor-pointer"
                          title="Diminuir"
                        >
                          <MinusCircle size={12} />
                        </button>
                        <span className="text-[11px] font-bold text-[#EAC154] w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleAdjustStockQty(item.id, 1)}
                          className="text-white/40 hover:text-white transition-colors cursor-pointer"
                          title="Aumentar"
                        >
                          <PlusCircle size={12} />
                        </button>
                      </div>

                      {/* Trash */}
                      <button 
                        onClick={() => handleDeleteStock(item.id)}
                        className="p-1 text-white/20 hover:text-red-400 transition-all cursor-pointer"
                        title="Excluir item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* IDEAS MURAL BOX */}
          <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-headline uppercase tracking-widest font-semibold text-white">Mural de Ideias</h2>
              </div>
              <button 
                onClick={() => setIsAddingIdea(!isAddingIdea)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5C0612]/20 border border-[#5C0612]/30 hover:bg-[#5C0612]/40 hover:text-white transition-all text-xs font-headline uppercase tracking-wider text-red-300 cursor-pointer"
              >
                {isAddingIdea ? <X size={12} /> : <Plus size={12} />}
                {isAddingIdea ? "Fechar" : "Nova Ideia"}
              </button>
            </div>

            {/* Expandable Idea Form */}
            <AnimatePresence>
              {isAddingIdea && (
                <motion.form 
                  onSubmit={handleAddIdea}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase text-white/40 tracking-wider">Título da Ideia</label>
                    <input 
                      type="text" 
                      required
                      value={ideaTitle}
                      onChange={(e) => setIdeaTitle(e.target.value)}
                      placeholder="Ex: Adega Subterrânea, Balcão de Vidro..."
                      className="bg-black/35 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase text-white/40 tracking-wider">Descrição / Notas</label>
                    <textarea 
                      rows={2}
                      required
                      value={ideaDesc}
                      onChange={(e) => setIdeaDesc(e.target.value)}
                      placeholder="Como deve funcionar a ideia?"
                      className="bg-black/35 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase text-white/40 tracking-wider">Categoria</label>
                      <select
                        value={ideaCat}
                        onChange={(e) => setIdeaCat(e.target.value)}
                        className="bg-black/35 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      >
                        <option value="Decoração">Decoração</option>
                        <option value="Iluminação">Iluminação</option>
                        <option value="Vinhos">Vinhos</option>
                        <option value="Móveis">Móveis</option>
                        <option value="Design">Design</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase text-white/40 tracking-wider">Cor de Fundo</label>
                      <div className="flex gap-1.5 mt-1">
                        {(["gold", "burgundy", "sage", "terracotta", "charcoal"] as const).map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setIdeaColor(col)}
                            className={clsx(
                              "w-5 h-5 rounded-full border transition-transform cursor-pointer",
                              col === "gold" && "bg-amber-600 border-amber-400",
                              col === "burgundy" && "bg-[#5C0612] border-red-800",
                              col === "sage" && "bg-emerald-900 border-emerald-700",
                              col === "terracotta" && "bg-orange-900 border-orange-700",
                              col === "charcoal" && "bg-neutral-800 border-neutral-600",
                              ideaColor === col ? "scale-120 border-white" : "border-transparent hover:scale-110"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#EAC154] text-black font-headline uppercase tracking-wider font-semibold text-[10px] hover:brightness-110 transition-all cursor-pointer"
                    >
                      Colar no Mural
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Ideas Grid */}
            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-1">
              {ideas.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  <p className="text-xs text-white/40">Mural de ideias vazio.</p>
                </div>
              ) : (
                ideas.map((idea) => (
                  <div 
                    key={idea.id}
                    className={clsx(
                      "p-4 rounded-xl border flex flex-col gap-2 relative group hover:shadow-lg transition-all",
                      idea.color === "gold" && "bg-amber-950/15 border-amber-500/20 hover:border-amber-500/40 text-amber-100",
                      idea.color === "burgundy" && "bg-[#5C0612]/10 border-[#5C0612]/20 hover:border-[#5C0612]/40 text-red-100",
                      idea.color === "sage" && "bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-100",
                      idea.color === "terracotta" && "bg-orange-950/10 border-orange-500/20 hover:border-orange-500/40 text-orange-100",
                      idea.color === "charcoal" && "bg-neutral-900/40 border-neutral-600/20 hover:border-neutral-600/40 text-neutral-100"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border bg-black/35 border-white/5 text-white/60">
                        {idea.category}
                      </span>

                      <button 
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="p-1 text-white/20 hover:text-red-400 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Excluir ideia"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <h3 className="text-xs font-semibold uppercase tracking-wider font-headline mt-1 text-white">
                      {idea.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed font-body font-light">
                      {idea.description}
                    </p>
                    
                    <span className="text-[8px] text-white/20 mt-2 text-right self-end font-light">
                      {idea.date}
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </section>

      {/* CLOUD SETTINGS DIALOG (GEAR OVERLAY) */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            
            {/* Dark blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-xl w-full glass-panel rounded-3xl p-8 border-[#D4AF37]/20 bg-gradient-to-b from-[#180F12] to-[#0A0607] shadow-[0_0_50px_rgba(92,6,18,0.3)] flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl">
                    <Database className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-headline uppercase tracking-widest font-semibold text-white">Credenciais de Nuvem</h3>
                    <p className="text-[9.5px] uppercase tracking-wider text-white/40 font-body">Conexão Ativa Compartilhada</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSaveConnection} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase text-white/40 tracking-wider">Supabase URL</label>
                  <input 
                    type="url" 
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://xxxxxx.supabase.co"
                    className="bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5 font-mono">
                  <label className="text-[10px] uppercase text-white/40 tracking-wider font-body">Supabase Anon Public Key</label>
                  <input 
                    type="password" 
                    required
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="bg-black/45 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all font-mono"
                  />
                </div>

                {dbError && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2 items-start leading-relaxed">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{dbError}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-end mt-2">
                  <button 
                    type="button"
                    onClick={handleDisconnect}
                    className="px-4 py-2.5 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 font-headline uppercase tracking-wider font-semibold text-xs hover:bg-red-950/50 hover:text-white transition-all cursor-pointer"
                  >
                    Desconectar Banco (Sair)
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={isTestingConfig}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#EAC154] text-black font-headline uppercase tracking-wider font-semibold text-xs hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingConfig ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </button>
                </div>
              </form>

              {/* SQL Help Box */}
              <div className="border-t border-white/5 pt-5">
                <button
                  onClick={() => setShowSqlHelp(!showSqlHelp)}
                  className="flex items-center justify-between w-full text-xs font-headline uppercase tracking-wider text-[#D4AF37] font-semibold hover:text-white transition-colors cursor-pointer"
                >
                  <span>1. Clique para ver o SQL das Tabelas</span>
                  <span>{showSqlHelp ? "Recolher" : "Expandir"}</span>
                </button>
                
                {showSqlHelp && (
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="relative">
                      <pre className="bg-black/55 text-emerald-400 p-3 rounded-lg text-[9px] font-mono overflow-x-auto max-h-[150px] border border-white/5 select-all">
                        {sqlCreateScripts}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(sqlCreateScripts)}
                        className="absolute top-2 right-2 p-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[#D4AF37] cursor-pointer"
                        title="Copiar Código SQL"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Vintage Deco Element */}
      <div className="fixed bottom-6 left-6 z-[100] opacity-35 hover:opacity-100 transition-all pointer-events-auto">
        <div className="glass-panel p-2.5 rounded-full flex items-center gap-2 border-[#D4AF37]/20 bg-black/40">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[8px] font-headline uppercase tracking-widest text-[#D4AF37]">The Best Adega</span>
        </div>
      </div>

    </main>
  );
}
