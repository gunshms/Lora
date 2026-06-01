"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSupabaseClient, SupabaseConfig } from "@/services/supabase";

export interface CostItem {
  id: string;
  description: string;
  amount: number;
  buyer: "gu" | "melhor";
  paid: boolean;
  date: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  color: "burgundy" | "gold" | "sage" | "terracotta" | "charcoal";
  date: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  status: "urgent" | "planned" | "in_stock";
}

export interface FixedCostItem {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  paidThisMonth: boolean;
  assignee: "gu" | "melhor" | "ambos";
}

interface AdegaContextType {
  costs: CostItem[];
  ideas: IdeaItem[];
  stock: StockItem[];
  fixedCosts: FixedCostItem[];
  isLoadingData: boolean;
  isCloudMode: boolean;
  dbConfig: SupabaseConfig | null;
  dbError: string | null;
  isTestingConfig: boolean;
  mounted: boolean;
  
  // Cost actions
  addCost: (description: string, amount: string, buyer: "gu" | "melhor", paid: boolean) => Promise<boolean>;
  toggleCostPaid: (id: string) => Promise<void>;
  deleteCost: (id: string) => Promise<void>;
  
  // Idea actions
  addIdea: (title: string, description: string, category: string, color: IdeaItem["color"]) => Promise<boolean>;
  deleteIdea: (id: string) => Promise<void>;
  
  // Stock actions
  addStock: (name: string, quantity: number, status: StockItem["status"]) => Promise<boolean>;
  adjustStockQty: (id: string, amount: number) => Promise<void>;
  toggleStockStatus: (id: string) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;

  // Fixed Cost actions
  addFixedCost: (description: string, amount: string, dueDay: number, assignee: FixedCostItem["assignee"]) => Promise<boolean>;
  toggleFixedCostPaid: (id: string) => Promise<void>;
  deleteFixedCost: (id: string) => Promise<void>;
  
  // Connection config
  saveConnection: (url: string, anonKey: string) => Promise<boolean>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
}

const AdegaContext = createContext<AdegaContextType | undefined>(undefined);

export function AdegaProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [dbConfig, setDbConfig] = useState<SupabaseConfig | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isTestingConfig, setIsTestingConfig] = useState(false);

  // Core Data States
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("thebest_db_config");
    let activeConfig: SupabaseConfig | null = null;
    
    if (savedConfig) {
      activeConfig = JSON.parse(savedConfig);
      setDbConfig(activeConfig);
    } else {
      // Check process.env variables as fallback
      const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (envUrl && envKey) {
        activeConfig = { url: envUrl, anonKey: envKey };
        setDbConfig(activeConfig);
      }
    }

    initializeCloudData(activeConfig);
  }, []);

  // Offline/Local Fallback Sync Effects
  useEffect(() => {
    if (mounted && !isCloudMode) {
      localStorage.setItem("thebest_costs", JSON.stringify(costs));
    }
  }, [costs, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      localStorage.setItem("thebest_ideas", JSON.stringify(ideas));
    }
  }, [ideas, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      localStorage.setItem("thebest_stock", JSON.stringify(stock));
    }
  }, [stock, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      localStorage.setItem("thebest_fixed", JSON.stringify(fixedCosts));
    }
  }, [fixedCosts, isCloudMode, mounted]);

  const loadLocalFallback = () => {
    const localCosts = localStorage.getItem("thebest_costs");
    const localIdeas = localStorage.getItem("thebest_ideas");
    const localStock = localStorage.getItem("thebest_stock");
    const localFixed = localStorage.getItem("thebest_fixed");

    if (localCosts) setCosts(JSON.parse(localCosts));
    if (localIdeas) setIdeas(JSON.parse(localIdeas));
    if (localStock) setStock(JSON.parse(localStock));
    if (localFixed) setFixedCosts(JSON.parse(localFixed));
  };

  // Fetch all tables from Supabase strictly
  const initializeCloudData = async (config: SupabaseConfig | null) => {
    setIsLoadingData(true);
    setDbError(null);
    const client = getSupabaseClient(config);

    if (client) {
      try {
        const [costsRes, ideasRes, stockRes, fixedRes] = await Promise.all([
          client.from("thebest_costs").select("*").order("date", { ascending: false }),
          client.from("thebest_ideas").select("*").order("date", { ascending: false }),
          client.from("thebest_stock").select("*"),
          client.from("thebest_fixed").select("*").order("dueDay", { ascending: true }),
        ]);

        if (costsRes.error) throw new Error(`Erro na tabela de custos: ${costsRes.error.message}`);
        if (ideasRes.error) throw new Error(`Erro na tabela de ideias: ${ideasRes.error.message}`);
        if (stockRes.error) throw new Error(`Erro na tabela de estoque: ${stockRes.error.message}`);

        // Handle thebest_fixed table error gracefully (if table not created yet)
        if (fixedRes.error) {
          console.warn("Tabela 'thebest_fixed' não encontrada. Usando dados locais.", fixedRes.error.message);
          const localFixed = localStorage.getItem("thebest_fixed");
          if (localFixed) setFixedCosts(JSON.parse(localFixed));
        } else {
          setFixedCosts(fixedRes.data || []);
        }

        // Successfully loaded from Cloud!
        setCosts(costsRes.data || []);
        setIdeas(ideasRes.data || []);
        setStock(stockRes.data || []);
        setIsCloudMode(true);
      } catch (err: any) {
        console.error("Supabase load error:", err);
        setDbError(err.message || "Falha ao consultar tabelas na nuvem.");
        setIsCloudMode(false);
        loadLocalFallback();
      } finally {
        setIsLoadingData(false);
        setMounted(true);
      }
    } else {
      setIsCloudMode(false);
      loadLocalFallback();
      setIsLoadingData(false);
      setMounted(true);
    }
  };

  const reconnect = async () => {
    await initializeCloudData(dbConfig);
  };

  // Connect and test Supabase connection
  const saveConnection = async (url: string, anonKey: string): Promise<boolean> => {
    if (!url.trim() || !anonKey.trim()) {
      setDbError("Por favor, preencha a URL e a Chave Anon.");
      return false;
    }

    setIsTestingConfig(true);
    setDbError(null);

    const testConfig = { url: url.trim(), anonKey: anonKey.trim() };
    const client = getSupabaseClient(testConfig);

    if (!client) {
      setDbError("URL ou Chave inválidas.");
      setIsTestingConfig(false);
      return false;
    }

    try {
      const { error } = await client.from("thebest_costs").select("id").limit(1);
      
      if (error) {
        throw new Error(`Conexão OK, mas tabelas não encontradas: ${error.message}`);
      }

      // Successful connection!
      localStorage.setItem("thebest_db_config", JSON.stringify(testConfig));
      setDbConfig(testConfig);
      await initializeCloudData(testConfig);
      return true;
    } catch (err: any) {
      setDbError(err.message || "Erro ao conectar ao Supabase.");
      setIsCloudMode(false);
      return false;
    } finally {
      setIsTestingConfig(false);
    }
  };

  // Disconnect / Logout Database
  const disconnect = () => {
    localStorage.removeItem("thebest_db_config");
    setDbConfig(null);
    setIsCloudMode(false);
    setDbError(null);
    setCosts([]);
    setIdeas([]);
    setStock([]);
    setFixedCosts([]);
  };

  // Cost Actions
  const addCost = async (description: string, amount: string, buyer: "gu" | "melhor", paid: boolean): Promise<boolean> => {
    if (!description.trim() || !amount) return false;

    const parsedVal = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedVal) || parsedVal <= 0) return false;

    const newCost: CostItem = {
      id: `c-${Date.now()}`,
      description: description.trim(),
      amount: parsedVal,
      buyer: buyer,
      paid: paid,
      date: new Date().toISOString().split("T")[0],
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return false;

      const { error } = await client.from("thebest_costs").insert(newCost);
      if (error) {
        alert(`Erro ao salvar na nuvem: ${error.message}`);
        return false;
      }
    }

    setCosts((prev) => [newCost, ...prev]);
    return true;
  };

  const toggleCostPaid = async (id: string) => {
    const targetItem = costs.find((c) => c.id === id);
    if (!targetItem) return;

    const updatedPaid = !targetItem.paid;

    if (isCloudMode) {
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
    }

    setCosts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, paid: updatedPaid } : c))
    );
  };

  const deleteCost = async (id: string) => {
    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return;

      const { error } = await client.from("thebest_costs").delete().eq("id", id);
      if (error) {
        alert(`Erro ao deletar na nuvem: ${error.message}`);
        return;
      }
    }

    setCosts((prev) => prev.filter((c) => c.id !== id));
  };

  // Idea Actions
  const addIdea = async (title: string, description: string, category: string, color: IdeaItem["color"]): Promise<boolean> => {
    if (!title.trim() || !description.trim()) return false;

    const newIdea: IdeaItem = {
      id: `i-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category: category,
      color: color,
      date: new Date().toISOString().split("T")[0],
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return false;

      const { error } = await client.from("thebest_ideas").insert(newIdea);
      if (error) {
        alert(`Erro ao salvar ideia na nuvem: ${error.message}`);
        return false;
      }
    }

    setIdeas((prev) => [newIdea, ...prev]);
    return true;
  };

  const deleteIdea = async (id: string) => {
    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return;

      const { error } = await client.from("thebest_ideas").delete().eq("id", id);
      if (error) {
        alert(`Erro ao deletar ideia na nuvem: ${error.message}`);
        return;
      }
    }

    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  // Stock Actions
  const addStock = async (name: string, quantity: number, status: StockItem["status"]): Promise<boolean> => {
    if (!name.trim() || quantity <= 0) return false;

    const newStock: StockItem = {
      id: `s-${Date.now()}`,
      name: name.trim(),
      quantity: quantity,
      status: status,
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return false;

      const { error } = await client.from("thebest_stock").insert(newStock);
      if (error) {
        alert(`Erro ao salvar estoque na nuvem: ${error.message}`);
        return false;
      }
    }

    setStock((prev) => [newStock, ...prev]);
    return true;
  };

  const adjustStockQty = async (id: string, amount: number) => {
    const item = stock.find((s) => s.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + amount);

    if (isCloudMode) {
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
    }

    setStock((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantity: newQty } : s))
    );
  };

  const toggleStockStatus = async (id: string) => {
    const item = stock.find((s) => s.id === id);
    if (!item) return;

    const cycle: Record<StockItem["status"], StockItem["status"]> = {
      urgent: "planned",
      planned: "in_stock",
      in_stock: "urgent",
    };
    const nextStatus = cycle[item.status];

    if (isCloudMode) {
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
    }

    setStock((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
  };

  const deleteStock = async (id: string) => {
    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return;

      const { error } = await client.from("thebest_stock").delete().eq("id", id);
      if (error) {
        alert(`Erro ao deletar item de estoque na nuvem: ${error.message}`);
        return;
      }
    }

    setStock((prev) => prev.filter((s) => s.id !== id));
  };

  // Fixed Cost Actions
  const addFixedCost = async (description: string, amount: string, dueDay: number, assignee: FixedCostItem["assignee"]): Promise<boolean> => {
    if (!description.trim() || !amount) return false;

    const parsedVal = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedVal) || parsedVal <= 0) return false;

    const newFixed: FixedCostItem = {
      id: `f-${Date.now()}`,
      description: description.trim(),
      amount: parsedVal,
      dueDay: dueDay,
      paidThisMonth: false,
      assignee: assignee,
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return false;

      const { error } = await client.from("thebest_fixed").insert(newFixed);
      if (error) {
        console.warn(`Erro ao salvar conta fixa na nuvem: ${error.message}. Salvando localmente.`);
      }
    }

    setFixedCosts((prev) => [...prev, newFixed].sort((a, b) => a.dueDay - b.dueDay));
    return true;
  };

  const toggleFixedCostPaid = async (id: string) => {
    const targetItem = fixedCosts.find((f) => f.id === id);
    if (!targetItem) return;

    const updatedPaid = !targetItem.paidThisMonth;

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return;

      const { error } = await client
        .from("thebest_fixed")
        .update({ paidThisMonth: updatedPaid })
        .eq("id", id);
      
      if (error) {
        console.warn(`Erro ao atualizar conta fixa na nuvem: ${error.message}. Atualizando localmente.`);
      }
    }

    setFixedCosts((prev) =>
      prev.map((f) => (f.id === id ? { ...f, paidThisMonth: updatedPaid } : f))
    );
  };

  const deleteFixedCost = async (id: string) => {
    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return;

      const { error } = await client.from("thebest_fixed").delete().eq("id", id);
      if (error) {
        console.warn(`Erro ao deletar conta fixa na nuvem: ${error.message}. Deletando localmente.`);
      }
    }

    setFixedCosts((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <AdegaContext.Provider
      value={{
        costs,
        ideas,
        stock,
        fixedCosts,
        isLoadingData,
        isCloudMode,
        dbConfig,
        dbError,
        isTestingConfig,
        mounted,
        addCost,
        toggleCostPaid,
        deleteCost,
        addIdea,
        deleteIdea,
        addStock,
        adjustStockQty,
        toggleStockStatus,
        deleteStock,
        addFixedCost,
        toggleFixedCostPaid,
        deleteFixedCost,
        saveConnection,
        disconnect,
        reconnect
      }}
    >
      {children}
    </AdegaContext.Provider>
  );
}

export function useAdega() {
  const context = useContext(AdegaContext);
  if (!context) {
    throw new Error("useAdega deve ser usado dentro de um AdegaProvider");
  }
  return context;
}
