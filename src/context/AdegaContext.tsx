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
  price_cost?: number;
  price_sell?: number;
  barcode?: string;
}

export interface FixedCostItem {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  paidThisMonth: boolean;
  assignee: "gu" | "melhor" | "ambos";
}

export interface SaleItem {
  id: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price_cost: number;
    price_sell: number;
  }[];
  total_amount: number;
  payment_method: "pix" | "dinheiro" | "credito" | "debito";
  profit: number;
  date: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  date: string;
}

interface AdegaContextType {
  costs: CostItem[];
  ideas: IdeaItem[];
  stock: StockItem[];
  fixedCosts: FixedCostItem[];
  sales: SaleItem[];
  auditLog: AuditEntry[];
  currentUser: "Oliveira" | "Marques" | null;
  isLoadingData: boolean;
  isCloudMode: boolean;
  dbConfig: SupabaseConfig | null;
  dbError: string | null;
  isTestingConfig: boolean;
  mounted: boolean;
  
  // Auth actions
  login: (username: "Oliveira" | "Marques", pin: string) => boolean;
  logout: () => void;

  // Cost actions
  addCost: (description: string, amount: string, buyer: "gu" | "melhor", paid: boolean) => Promise<boolean>;
  toggleCostPaid: (id: string) => Promise<void>;
  deleteCost: (id: string) => Promise<void>;
  
  // Idea actions
  addIdea: (title: string, description: string, category: string, color: IdeaItem["color"]) => Promise<boolean>;
  deleteIdea: (id: string) => Promise<void>;
  
  // Stock actions
  addStock: (name: string, quantity: number, status: StockItem["status"], priceCost?: string, priceSell?: string, barcode?: string) => Promise<boolean>;
  adjustStockQty: (id: string, amount: number) => Promise<void>;
  toggleStockStatus: (id: string) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;
  updateStockPrices: (id: string, priceCost: string, priceSell: string, barcode?: string) => Promise<boolean>;

  // Fixed Cost actions
  addFixedCost: (description: string, amount: string, dueDay: number, assignee: FixedCostItem["assignee"]) => Promise<boolean>;
  toggleFixedCostPaid: (id: string) => Promise<void>;
  deleteFixedCost: (id: string) => Promise<void>;

  // Sales actions
  registerSale: (items: { id: string; name: string; quantity: number; price_cost: number; price_sell: number }[], paymentMethod: "pix" | "dinheiro" | "credito" | "debito") => Promise<boolean>;
  deleteSale: (id: string) => Promise<void>;
  
  // Audit Actions
  clearAuditLog: () => Promise<void>;

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

  // Auth States
  const [currentUser, setCurrentUser] = useState<"Oliveira" | "Marques" | null>(null);

  // Core Data States
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load configuration and user session on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("thebest_db_config");
    let activeConfig: SupabaseConfig | null = null;
    
    if (savedConfig) {
      activeConfig = JSON.parse(savedConfig);
      setDbConfig(activeConfig);
    } else {
      const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (envUrl && envKey) {
        activeConfig = { url: envUrl, anonKey: envKey };
        setDbConfig(activeConfig);
      }
    }

    const savedUser = localStorage.getItem("thebest_current_user");
    if (savedUser === "Oliveira" || savedUser === "Marques") {
      setCurrentUser(savedUser);
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

  useEffect(() => {
    if (mounted && !isCloudMode) {
      localStorage.setItem("thebest_sales", JSON.stringify(sales));
    }
  }, [sales, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      localStorage.setItem("thebest_audit", JSON.stringify(auditLog));
    }
  }, [auditLog, isCloudMode, mounted]);

  const loadLocalFallback = () => {
    const localCosts = localStorage.getItem("thebest_costs");
    const localIdeas = localStorage.getItem("thebest_ideas");
    const localStock = localStorage.getItem("thebest_stock");
    const localFixed = localStorage.getItem("thebest_fixed");
    const localSales = localStorage.getItem("thebest_sales");
    const localAudit = localStorage.getItem("thebest_audit");

    if (localCosts) setCosts(JSON.parse(localCosts));
    if (localIdeas) setIdeas(JSON.parse(localIdeas));
    if (localStock) setStock(JSON.parse(localStock));
    if (localFixed) setFixedCosts(JSON.parse(localFixed));
    if (localSales) setSales(JSON.parse(localSales));
    if (localAudit) setAuditLog(JSON.parse(localAudit));
  };

  // Fetch all tables from Supabase strictly
  const initializeCloudData = async (config: SupabaseConfig | null) => {
    setIsLoadingData(true);
    setDbError(null);
    const client = getSupabaseClient(config);

    if (client) {
      try {
        const [costsRes, ideasRes, stockRes, fixedRes, salesRes, auditRes] = await Promise.all([
          client.from("thebest_costs").select("*").order("date", { ascending: false }),
          client.from("thebest_ideas").select("*").order("date", { ascending: false }),
          client.from("thebest_stock").select("*"),
          client.from("thebest_fixed").select("*").order("dueDay", { ascending: true }),
          client.from("thebest_sales").select("*").order("date", { ascending: false }),
          client.from("thebest_audit").select("*").order("date", { ascending: false }),
        ]);

        if (costsRes.error) throw new Error(`Erro na tabela de custos: ${costsRes.error.message}`);
        if (ideasRes.error) throw new Error(`Erro na tabela de ideias: ${ideasRes.error.message}`);
        if (stockRes.error) throw new Error(`Erro na tabela de estoque: ${stockRes.error.message}`);

        // Handle fixed costs error gracefully
        if (fixedRes.error) {
          console.warn("Tabela 'thebest_fixed' não encontrada. Usando dados locais.", fixedRes.error.message);
          const localFixed = localStorage.getItem("thebest_fixed");
          if (localFixed) setFixedCosts(JSON.parse(localFixed));
        } else {
          setFixedCosts(fixedRes.data || []);
        }

        // Handle sales table error gracefully
        if (salesRes.error) {
          console.warn("Tabela 'thebest_sales' não encontrada. Usando dados locais.", salesRes.error.message);
          const localSales = localStorage.getItem("thebest_sales");
          if (localSales) setSales(JSON.parse(localSales));
        } else {
          setSales(salesRes.data || []);
        }

        // Handle audit table error gracefully
        if (auditRes.error) {
          console.warn("Tabela 'thebest_audit' não encontrada. Usando dados locais.", auditRes.error.message);
          const localAudit = localStorage.getItem("thebest_audit");
          if (localAudit) setAuditLog(JSON.parse(localAudit));
        } else {
          setAuditLog(auditRes.data || []);
        }

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

  // Auth Actions
  const login = (username: "Oliveira" | "Marques", pin: string): boolean => {
    const credentials = {
      Oliveira: "1105",
      Marques: "3009"
    };

    if (credentials[username] === pin) {
      setCurrentUser(username);
      localStorage.setItem("thebest_current_user", username);
      // Log login success
      logAction(`Entrou no sistema`, username);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logAction(`Saiu do sistema`, currentUser);
    }
    setCurrentUser(null);
    localStorage.removeItem("thebest_current_user");
  };

  // Action audit logging helper
  const logAction = async (actionDesc: string, overrideUser?: string) => {
    const actingUser = overrideUser || currentUser || "Desconhecido";
    const entry: AuditEntry = {
      id: `a-${Date.now()}`,
      user: actingUser,
      action: actionDesc,
      date: new Date().toISOString()
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        const { error } = await client.from("thebest_audit").insert(entry);
        if (error) {
          console.warn("Erro ao salvar log de auditoria na nuvem:", error.message);
        }
      }
    }

    setAuditLog((prev) => [entry, ...prev]);
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

  const disconnect = () => {
    localStorage.removeItem("thebest_db_config");
    setDbConfig(null);
    setIsCloudMode(false);
    setDbError(null);
    setCosts([]);
    setIdeas([]);
    setStock([]);
    setFixedCosts([]);
    setSales([]);
    setAuditLog([]);
    setCurrentUser(null);
    localStorage.removeItem("thebest_current_user");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
    logAction(`Lançou custo variável '${description.trim()}' no valor de ${formatCurrency(parsedVal)}`);
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
    logAction(`Alterou pagamento do custo '${targetItem.description}' para ${updatedPaid ? "Pago" : "Pendente"}`);
  };

  const deleteCost = async (id: string) => {
    const targetItem = costs.find((c) => c.id === id);
    if (!targetItem) return;

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
    logAction(`Excluiu custo variável '${targetItem.description}'`);
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
    logAction(`Adicionou ideia '${title.trim()}' ao mural criativo`);
    return true;
  };

  const deleteIdea = async (id: string) => {
    const targetItem = ideas.find((i) => i.id === id);
    if (!targetItem) return;

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
    logAction(`Excluiu ideia '${targetItem.title}' do mural`);
  };

  // Stock Actions
  const addStock = async (
    name: string, 
    quantity: number, 
    status: StockItem["status"],
    priceCost?: string,
    priceSell?: string,
    barcode?: string
  ): Promise<boolean> => {
    if (!name.trim() || quantity <= 0) return false;

    const parsedCost = priceCost ? parseFloat(priceCost.replace(",", ".")) : 0;
    const parsedSell = priceSell ? parseFloat(priceSell.replace(",", ".")) : 0;

    const newStock: StockItem = {
      id: `s-${Date.now()}`,
      name: name.trim(),
      quantity: quantity,
      status: status,
      price_cost: isNaN(parsedCost) ? 0 : parsedCost,
      price_sell: isNaN(parsedSell) ? 0 : parsedSell,
      barcode: barcode?.trim() || undefined,
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
    logAction(`Adicionou produto '${name.trim()}' (${quantity} unidades) ao estoque`);
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
    logAction(`Ajustou quantidade de '${item.name}' em ${amount > 0 ? `+${amount}` : amount} (Saldo: ${newQty})`);
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
    logAction(`Alterou status do estoque de '${item.name}' para '${nextStatus}'`);
  };

  const deleteStock = async (id: string) => {
    const item = stock.find((s) => s.id === id);
    if (!item) return;

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
    logAction(`Excluiu produto '${item.name}' do catálogo de estoque`);
  };

  const updateStockPrices = async (id: string, priceCost: string, priceSell: string, barcode?: string): Promise<boolean> => {
    const item = stock.find((s) => s.id === id);
    if (!item) return false;

    const parsedCost = parseFloat(priceCost.replace(",", "."));
    const parsedSell = parseFloat(priceSell.replace(",", "."));

    if (isNaN(parsedCost) || isNaN(parsedSell)) return false;

    const updateFields = {
      price_cost: parsedCost,
      price_sell: parsedSell,
      barcode: barcode?.trim() || null
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        const { error } = await client
          .from("thebest_stock")
          .update(updateFields)
          .eq("id", id);
        
        if (error) {
          console.error("Erro ao atualizar preços na nuvem:", error.message);
          return false;
        }
      }
    }

    setStock((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              price_cost: parsedCost,
              price_sell: parsedSell,
              barcode: barcode?.trim() || undefined
            }
          : s
      )
    );
    logAction(`Definiu preços de '${item.name}' para Custo: ${formatCurrency(parsedCost)} e Venda: ${formatCurrency(parsedSell)}`);
    return true;
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
    logAction(`Cadastrou conta fixa '${description.trim()}' no valor de ${formatCurrency(parsedVal)} com vencimento no dia ${dueDay}`);
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
    logAction(`Alterou status de quitação da conta fixa '${targetItem.description}' para ${updatedPaid ? "Pago" : "Pendente"}`);
  };

  const deleteFixedCost = async (id: string) => {
    const targetItem = fixedCosts.find((f) => f.id === id);
    if (!targetItem) return;

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (!client) return;

      const { error } = await client.from("thebest_fixed").delete().eq("id", id);
      if (error) {
        console.warn(`Erro ao deletar conta fixa na nuvem: ${error.message}. Deletando localmente.`);
      }
    }

    setFixedCosts((prev) => prev.filter((f) => f.id !== id));
    logAction(`Excluiu conta fixa '${targetItem.description}'`);
  };

  // Sales Actions
  const registerSale = async (
    items: { id: string; name: string; quantity: number; price_cost: number; price_sell: number }[],
    paymentMethod: "pix" | "dinheiro" | "credito" | "debito"
  ): Promise<boolean> => {
    if (items.length === 0) return false;

    const totalAmount = items.reduce((sum, item) => sum + (item.price_sell * item.quantity), 0);
    const totalCost = items.reduce((sum, item) => sum + (item.price_cost * item.quantity), 0);
    const profit = totalAmount - totalCost;

    const newSale: SaleItem = {
      id: `sale-${Date.now()}`,
      items,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      profit,
      date: new Date().toISOString(),
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        const { error: saleError } = await client.from("thebest_sales").insert(newSale);
        if (saleError) {
          console.error("Erro ao registrar venda na nuvem:", saleError.message);
        }

        // Decrement stock for each item
        for (const item of items) {
          const currentStockItem = stock.find(s => s.id === item.id);
          if (currentStockItem) {
            const nextQty = Math.max(0, currentStockItem.quantity - item.quantity);
            await client.from("thebest_stock").update({ quantity: nextQty }).eq("id", item.id);
          }
        }
      }
    }

    // Update local stock levels
    setStock((prev) =>
      prev.map((s) => {
        const soldItem = items.find((item) => item.id === s.id);
        if (soldItem) {
          return { ...s, quantity: Math.max(0, s.quantity - soldItem.quantity) };
        }
        return s;
      })
    );

    // Save sale record
    setSales((prev) => [newSale, ...prev]);
    logAction(`Registrou venda no PDV no valor de ${formatCurrency(totalAmount)} (${items.length} itens) via ${paymentMethod.toUpperCase()}`);
    return true;
  };

  const deleteSale = async (id: string) => {
    const targetSale = sales.find((s) => s.id === id);
    if (!targetSale) return;

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        const { error } = await client.from("thebest_sales").delete().eq("id", id);
        if (error) {
          console.error("Erro ao deletar venda na nuvem:", error.message);
          return;
        }
      }
    }
    setSales((prev) => prev.filter((s) => s.id !== id));
    logAction(`Cancelou e excluiu a venda cupom '${id}' no valor total de ${formatCurrency(targetSale.total_amount)}`);
  };

  const clearAuditLog = async () => {
    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        const { error } = await client.from("thebest_audit").delete().neq("id", "0");
        if (error) {
          console.error("Erro ao limpar registros de auditoria:", error.message);
          return;
        }
      }
    }
    setAuditLog([]);
    logAction(`Limpou histórico de auditoria completo`);
  };

  return (
    <AdegaContext.Provider
      value={{
        costs,
        ideas,
        stock,
        fixedCosts,
        sales,
        auditLog,
        currentUser,
        isLoadingData,
        isCloudMode,
        dbConfig,
        dbError,
        isTestingConfig,
        mounted,
        login,
        logout,
        addCost,
        toggleCostPaid,
        deleteCost,
        addIdea,
        deleteIdea,
        addStock,
        adjustStockQty,
        toggleStockStatus,
        deleteStock,
        updateStockPrices,
        addFixedCost,
        toggleFixedCostPaid,
        deleteFixedCost,
        registerSale,
        deleteSale,
        clearAuditLog,
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
