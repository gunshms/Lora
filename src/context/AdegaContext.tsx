"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSupabaseClient, SupabaseConfig } from "@/services/supabase";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export interface CostItem {
  id: string;
  description: string;
  amount: number;
  buyer: "gu" | "melhor";
  paid: boolean;
  date: string;
  installments_count?: number;
  current_installment?: number;
  installment_parent_id?: string;
  receipt?: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  color: "burgundy" | "gold" | "sage" | "terracotta" | "charcoal";
  date: string;
}

export interface RecipeIngredient {
  product_id: string;
  quantity: number;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  status: "urgent" | "planned" | "in_stock";
  price_cost?: number;
  price_sell?: number;
  barcode?: string;
  recipe?: RecipeIngredient[];
  price_history?: { date: string; cost: number; sell: number }[];
}

export interface FixedCostItem {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  paidThisMonth: boolean;
  assignee: "gu" | "melhor" | "ambos";
  receipt?: string;
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
  payment_method: "pix" | "dinheiro" | "credito" | "debito" | "consumo_oliveira" | "consumo_marques" | "cortesia";
  profit: number;
  date: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  date: string;
}

export interface DebtItem {
  id: string;
  customer_name: string;
  amount: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price_cost: number;
    price_sell: number;
  }[];
  date: string;
  status: "pending" | "settled";
}

export interface HeldCart {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price_cost: number;
    price_sell: number;
  }[];
}

interface AdegaContextType {
  costs: CostItem[];
  ideas: IdeaItem[];
  stock: StockItem[];
  fixedCosts: FixedCostItem[];
  sales: SaleItem[];
  auditLog: AuditEntry[];
  debts: DebtItem[];
  currentUser: "Oliveira" | "Marques" | null;
  isLoadingData: boolean;
  isCloudMode: boolean;
  dbConfig: SupabaseConfig | null;
  dbError: string | null;
  isTestingConfig: boolean;
  mounted: boolean;

  // POS Session state
  isPosActive: boolean;
  setIsPosActive: (active: boolean) => void;
  activeCart: { id: string; name: string; quantity: number; price_cost: number; price_sell: number }[];
  setActiveCart: React.Dispatch<React.SetStateAction<{ id: string; name: string; quantity: number; price_cost: number; price_sell: number }[]>>;
  heldCarts: HeldCart[];
  setHeldCarts: React.Dispatch<React.SetStateAction<HeldCart[]>>;

  // Auth actions
  login: (username: "Oliveira" | "Marques", pin: string) => boolean;
  logout: () => void;

  // Cost actions
  addCost: (description: string, amount: string, buyer: "gu" | "melhor", paid: boolean, installmentsCount?: string, receipt?: string) => Promise<boolean>;
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
  updateStockPrices: (id: string, priceCost: string, priceSell: string, barcode?: string, name?: string, status?: StockItem["status"], recipe?: RecipeIngredient[]) => Promise<boolean>;

  // Fixed Cost actions
  addFixedCost: (description: string, amount: string, dueDay: number, assignee: FixedCostItem["assignee"], receipt?: string) => Promise<boolean>;
  toggleFixedCostPaid: (id: string) => Promise<void>;
  deleteFixedCost: (id: string) => Promise<void>;

  // Sales actions
  registerSale: (items: { id: string; name: string; quantity: number; price_cost: number; price_sell: number }[], paymentMethod: "pix" | "dinheiro" | "credito" | "debito" | "consumo_oliveira" | "consumo_marques" | "cortesia", discountAmount?: number) => Promise<boolean>;
  deleteSale: (id: string) => Promise<void>;
  
  // Debt/Fiado actions
  registerDebt: (customerName: string, items: { id: string; name: string; quantity: number; price_cost: number; price_sell: number }[], discountAmount?: number) => Promise<boolean>;
  settleDebt: (id: string, paymentMethod: "pix" | "dinheiro" | "credito" | "debito") => Promise<void>;
  renameDebtCustomer: (id: string, newName: string) => Promise<void>;

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

  // POS Session States (Persisted in global Context)
  const [isPosActive, setIsPosActive] = useState(false);
  const [activeCart, setActiveCart] = useState<{ id: string; name: string; quantity: number; price_cost: number; price_sell: number }[]>([]);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);

  // Core Data States
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
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

    // Recover POS sessions from local storage
    const savedActiveCart = localStorage.getItem("thebest_pdv_active_cart");
    const savedHeldCarts = localStorage.getItem("thebest_pdv_held_carts");
    const savedPosState = localStorage.getItem("thebest_pdv_active_state");
    
    if (savedActiveCart) setActiveCart(JSON.parse(savedActiveCart));
    if (savedHeldCarts) setHeldCarts(JSON.parse(savedHeldCarts));
    if (savedPosState) setIsPosActive(JSON.parse(savedPosState));

    initializeCloudData(activeConfig);
  }, []);

  // Safe localStorage helper to prevent QuotaExceededError crashes
  const safeLocalStorageSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error: any) {
      console.warn(`Erro ao salvar no localStorage para a chave ${key}:`, error);
      if (error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
        console.error("Limite de cota de armazenamento local do navegador excedido!");
      }
    }
  };

  // Sync active sessions locally
  useEffect(() => {
    safeLocalStorageSetItem("thebest_pdv_active_cart", JSON.stringify(activeCart));
  }, [activeCart]);

  useEffect(() => {
    safeLocalStorageSetItem("thebest_pdv_held_carts", JSON.stringify(heldCarts));
  }, [heldCarts]);

  useEffect(() => {
    safeLocalStorageSetItem("thebest_pdv_active_state", JSON.stringify(isPosActive));
  }, [isPosActive]);

  // Offline/Local Fallback Sync Effects
  useEffect(() => {
    if (mounted && !isCloudMode) {
      safeLocalStorageSetItem("thebest_costs", JSON.stringify(costs));
    }
  }, [costs, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      safeLocalStorageSetItem("thebest_ideas", JSON.stringify(ideas));
    }
  }, [ideas, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      safeLocalStorageSetItem("thebest_stock", JSON.stringify(stock));
    }
  }, [stock, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      safeLocalStorageSetItem("thebest_fixed", JSON.stringify(fixedCosts));
    }
  }, [fixedCosts, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      safeLocalStorageSetItem("thebest_sales", JSON.stringify(sales));
    }
  }, [sales, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      safeLocalStorageSetItem("thebest_debts", JSON.stringify(debts));
    }
  }, [debts, isCloudMode, mounted]);

  useEffect(() => {
    if (mounted && !isCloudMode) {
      safeLocalStorageSetItem("thebest_audit", JSON.stringify(auditLog));
    }
  }, [auditLog, isCloudMode, mounted]);

  const loadLocalFallback = () => {
    const localCosts = localStorage.getItem("thebest_costs");
    const localIdeas = localStorage.getItem("thebest_ideas");
    const localStock = localStorage.getItem("thebest_stock");
    const localFixed = localStorage.getItem("thebest_fixed");
    const localSales = localStorage.getItem("thebest_sales");
    const localDebts = localStorage.getItem("thebest_debts");
    const localAudit = localStorage.getItem("thebest_audit");

    if (localCosts) setCosts(JSON.parse(localCosts));
    if (localIdeas) setIdeas(JSON.parse(localIdeas));
    if (localStock) setStock(JSON.parse(localStock));
    if (localFixed) setFixedCosts(JSON.parse(localFixed));
    if (localSales) setSales(JSON.parse(localSales));
    if (localDebts) setDebts(JSON.parse(localDebts));
    if (localAudit) setAuditLog(JSON.parse(localAudit));
  };

  // Fetch all tables from Supabase strictly
  const initializeCloudData = async (config: SupabaseConfig | null) => {
    setIsLoadingData(true);
    setDbError(null);
    const client = getSupabaseClient(config);

    if (client) {
      try {
        const [costsRes, ideasRes, stockRes, fixedRes, salesRes, debtsRes, auditRes] = await Promise.all([
          client.from("thebest_costs").select("*").order("date", { ascending: false }),
          client.from("thebest_ideas").select("*").order("date", { ascending: false }),
          client.from("thebest_stock").select("*"),
          client.from("thebest_fixed").select("*").order("dueDay", { ascending: true }),
          client.from("thebest_sales").select("*").order("date", { ascending: false }),
          client.from("thebest_debts").select("*").order("date", { ascending: false }),
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

        // Handle debts table error gracefully
        if (debtsRes.error) {
          console.warn("Tabela 'thebest_debts' não encontrada. Usando dados locais.", debtsRes.error.message);
          const localDebts = localStorage.getItem("thebest_debts");
          if (localDebts) setDebts(JSON.parse(localDebts));
        } else {
          setDebts(debtsRes.data || []);
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
    setDebts([]);
    setCurrentUser(null);
    localStorage.removeItem("thebest_current_user");
  };

  // Date helper to project installments
  const addMonths = (dateStr: string, months: number): string => {
    const d = new Date(dateStr + "T12:00:00");
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0];
  };

  const deductStockLevels = async (
    items: { id: string; name: string; quantity: number }[],
    client: any
  ) => {
    let localStock = [...stock];

    for (const item of items) {
      const currentStockItem = localStock.find(s => s.id === item.id);
      if (!currentStockItem) continue;

      const hasRecipe = currentStockItem.recipe && currentStockItem.recipe.length > 0;
      const isSmartCombo = 
        !hasRecipe && 
        (item.name.toLowerCase().includes("copão") || 
         item.name.toLowerCase().includes("copao") || 
         item.name.toLowerCase().includes("combo") ||
         item.name.toLowerCase().includes("dose"));

      if (hasRecipe) {
        for (const ingredient of currentStockItem.recipe!) {
          const targetItem = localStock.find(s => s.id === ingredient.product_id);
          if (targetItem) {
            const nextQty = Math.max(0, targetItem.quantity - (ingredient.quantity * item.quantity));
            targetItem.quantity = parseFloat(nextQty.toFixed(2));
            
            if (client) {
              await client.from("thebest_stock").update({ quantity: targetItem.quantity }).eq("id", targetItem.id);
            }
          }
        }
        
        const nextComboQty = Math.max(0, currentStockItem.quantity - item.quantity);
        currentStockItem.quantity = parseFloat(nextComboQty.toFixed(2));
        if (client) {
          await client.from("thebest_stock").update({ quantity: currentStockItem.quantity }).eq("id", currentStockItem.id);
        }
      } else if (isSmartCombo) {
        const lowerName = item.name.toLowerCase();
        let mainDrinkBase: StockItem | undefined;
        let fraction = 0.25;

        if (lowerName.includes("absolut")) {
          mainDrinkBase = localStock.find(s => s.name.toLowerCase().includes("absolut") && !s.name.toLowerCase().includes("copã") && !s.name.toLowerCase().includes("copa") && !s.name.toLowerCase().includes("dose"));
        } else if (lowerName.includes("red label") || lowerName.includes("whisky red")) {
          mainDrinkBase = localStock.find(s => s.name.toLowerCase().includes("red label") && !s.name.toLowerCase().includes("copã") && !s.name.toLowerCase().includes("copa") && !s.name.toLowerCase().includes("dose"));
        } else if (lowerName.includes("smirnoff")) {
          mainDrinkBase = localStock.find(s => s.name.toLowerCase().includes("smirnoff") && !s.name.toLowerCase().includes("copã") && !s.name.toLowerCase().includes("copa") && !s.name.toLowerCase().includes("dose"));
        } else if (lowerName.includes("tanqueray") || lowerName.includes("gin")) {
          mainDrinkBase = localStock.find(s => s.name.toLowerCase().includes("gin") && !s.name.toLowerCase().includes("copã") && !s.name.toLowerCase().includes("copa") && !s.name.toLowerCase().includes("dose"));
        }

        if (mainDrinkBase) {
          const nextQty = Math.max(0, mainDrinkBase.quantity - (fraction * item.quantity));
          mainDrinkBase.quantity = parseFloat(nextQty.toFixed(2));
          if (client) {
            await client.from("thebest_stock").update({ quantity: mainDrinkBase.quantity }).eq("id", mainDrinkBase.id);
          }
        }

        const geloItem = localStock.find(s => s.name.toLowerCase().includes("gelo") && !s.name.toLowerCase().includes("copã") && !s.name.toLowerCase().includes("copa"));
        if (geloItem) {
          const nextQty = Math.max(0, geloItem.quantity - (1 * item.quantity));
          geloItem.quantity = parseFloat(nextQty.toFixed(2));
          if (client) {
            await client.from("thebest_stock").update({ quantity: geloItem.quantity }).eq("id", geloItem.id);
          }
        }

        const energeticoItem = localStock.find(s => s.name.toLowerCase().includes("energét") || s.name.toLowerCase().includes("energet") || s.name.toLowerCase().includes("red bull") || s.name.toLowerCase().includes("monster"));
        if (energeticoItem) {
          const nextQty = Math.max(0, energeticoItem.quantity - (1 * item.quantity));
          energeticoItem.quantity = parseFloat(nextQty.toFixed(2));
          if (client) {
            await client.from("thebest_stock").update({ quantity: energeticoItem.quantity }).eq("id", energeticoItem.id);
          }
        }

        const nextComboQty = Math.max(0, currentStockItem.quantity - item.quantity);
        currentStockItem.quantity = parseFloat(nextComboQty.toFixed(2));
        if (client) {
          await client.from("thebest_stock").update({ quantity: currentStockItem.quantity }).eq("id", currentStockItem.id);
        }
      } else {
        const nextQty = Math.max(0, currentStockItem.quantity - item.quantity);
        currentStockItem.quantity = parseFloat(nextQty.toFixed(2));
        if (client) {
          await client.from("thebest_stock").update({ quantity: currentStockItem.quantity }).eq("id", currentStockItem.id);
        }
      }
    }

    setStock(localStock);
  };

  // Cost Actions
  const addCost = async (
    description: string, 
    amount: string, 
    buyer: "gu" | "melhor", 
    paid: boolean,
    installmentsCount?: string,
    receipt?: string
  ): Promise<boolean> => {
    if (!description.trim() || !amount) return false;

    const parsedVal = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedVal) || parsedVal <= 0) return false;

    const count = installmentsCount ? parseInt(installmentsCount) : 1;
    const finalCount = isNaN(count) || count < 1 ? 1 : count;

    const splitAmount = parsedVal / finalCount;
    const parentId = finalCount > 1 ? `parent-${Date.now()}` : undefined;
    const initialDate = new Date().toISOString().split("T")[0];

    const generatedCosts: CostItem[] = [];

    for (let i = 1; i <= finalCount; i++) {
      const targetDate = addMonths(initialDate, i - 1);
      const descText = finalCount > 1 ? `${description.trim()} (${i}/${finalCount})` : description.trim();

      const newCost: CostItem = {
        id: `c-${Date.now()}-${i}`,
        description: descText,
        amount: parseFloat(splitAmount.toFixed(2)),
        buyer: buyer,
        paid: paid,
        date: targetDate,
        installments_count: finalCount > 1 ? finalCount : undefined,
        current_installment: finalCount > 1 ? i : undefined,
        installment_parent_id: parentId,
        receipt: receipt
      };

      if (isCloudMode) {
        try {
          const client = getSupabaseClient(dbConfig);
          if (client) {
            const { error } = await client.from("thebest_costs").insert(newCost);
            if (error) {
              console.error("Erro ao salvar parcela na nuvem:", error.message);
            }
          }
        } catch (dbErr) {
          console.error("Exceção ao salvar custo na nuvem (provável limite de tamanho):", dbErr);
        }
      }

      generatedCosts.push(newCost);
    }

    setCosts((prev) => [...generatedCosts, ...prev]);

    if (finalCount > 1) {
      logAction(`Lançou despesa parcelada '${description.trim()}' em ${finalCount}x de ${formatCurrency(splitAmount)} (Total: ${formatCurrency(parsedVal)})${receipt ? " com comprovante" : ""}`);
    } else {
      logAction(`Lançou custo variável '${description.trim()}' no valor de ${formatCurrency(parsedVal)}${receipt ? " com comprovante" : ""}`);
    }

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

  const updateStockPrices = async (
    id: string, 
    priceCost: string, 
    priceSell: string, 
    barcode?: string,
    name?: string,
    status?: StockItem["status"],
    recipe?: RecipeIngredient[]
  ): Promise<boolean> => {
    const item = stock.find((s) => s.id === id);
    if (!item) return false;

    const parsedCost = parseFloat(priceCost.replace(",", "."));
    const parsedSell = parseFloat(priceSell.replace(",", "."));

    if (isNaN(parsedCost) || isNaN(parsedSell)) return false;

    const currentCost = item.price_cost || 0;
    const currentSell = item.price_sell || 0;
    const nextCost = parsedCost;
    const nextSell = parsedSell;
    
    let newHistory = item.price_history || [];
    if (currentCost !== nextCost || currentSell !== nextSell) {
      newHistory = [
        ...newHistory,
        {
          date: new Date().toISOString().split("T")[0],
          cost: nextCost,
          sell: nextSell
        }
      ].slice(-10); // Mantém as últimas 10 alterações para economizar cota de espaço
    }

    const updateFields: any = {
      price_cost: parsedCost,
      price_sell: parsedSell,
      barcode: barcode?.trim() || null,
      name: name ? name.trim() : item.name,
      status: status || item.status,
      recipe: recipe || null,
      price_history: newHistory
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        const { error } = await client
          .from("thebest_stock")
          .update(updateFields)
          .eq("id", id);
        
        if (error) {
          console.error("Erro ao atualizar produto na nuvem:", error.message);
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
              barcode: barcode?.trim() || undefined,
              name: name ? name.trim() : s.name,
              status: status || s.status,
              recipe: recipe || undefined,
              price_history: newHistory
            }
          : s
      )
    );
    logAction(`Editou dados do produto '${name ? name.trim() : item.name}' (Custo: ${formatCurrency(parsedCost)}, Venda: ${formatCurrency(parsedSell)})`);
    return true;
  };

  // Fixed Cost Actions
  const addFixedCost = async (description: string, amount: string, dueDay: number, assignee: FixedCostItem["assignee"], receipt?: string): Promise<boolean> => {
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
      receipt: receipt
    };

    if (isCloudMode) {
      try {
        const client = getSupabaseClient(dbConfig);
        if (client) {
          const { error } = await client.from("thebest_fixed").insert(newFixed);
          if (error) {
            console.warn(`Erro ao salvar conta fixa na nuvem: ${error.message}. Salvando localmente.`);
          }
        }
      } catch (dbErr) {
        console.warn("Exceção ao salvar conta fixa na nuvem (provável limite de tamanho):", dbErr);
      }
    }

    setFixedCosts((prev) => [...prev, newFixed].sort((a, b) => a.dueDay - b.dueDay));
    logAction(`Cadastrou conta fixa '${description.trim()}' no valor de ${formatCurrency(parsedVal)} com vencimento no dia ${dueDay}${receipt ? " com comprovante" : ""}`);
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
    paymentMethod: "pix" | "dinheiro" | "credito" | "debito" | "consumo_oliveira" | "consumo_marques" | "cortesia",
    discountAmount = 0
  ): Promise<boolean> => {
    if (items.length === 0) return false;

    const rawTotal = items.reduce((sum, item) => sum + (item.price_sell * item.quantity), 0);
    const isPersonalOrCortesia = paymentMethod === "consumo_oliveira" || paymentMethod === "consumo_marques" || paymentMethod === "cortesia";
    const totalAmount = isPersonalOrCortesia ? 0 : Math.max(0, rawTotal - discountAmount);
    
    // Distribute discount proportionally across items for accurate profit math
    const discountRatio = rawTotal > 0 ? totalAmount / rawTotal : 0;
    const totalCost = items.reduce((sum, item) => sum + (item.price_cost * item.quantity), 0);
    const profit = totalAmount - totalCost;

    const newSale: SaleItem = {
      id: `sale-${Date.now()}`,
      items: items.map(i => ({ ...i, price_sell: isPersonalOrCortesia ? 0 : i.price_sell * discountRatio })),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      payment_method: paymentMethod,
      profit: parseFloat(profit.toFixed(2)),
      date: new Date().toISOString()
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        const { error: saleError } = await client.from("thebest_sales").insert(newSale);
        if (saleError) {
          console.error("Erro ao registrar venda na nuvem:", saleError.message);
        }
        await deductStockLevels(items, client);
      }
    } else {
      await deductStockLevels(items, null);
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
    logAction(`Registrou venda no PDV de ${formatCurrency(totalAmount)} (${items.length} itens) via ${paymentMethod.toUpperCase()}${discountAmount > 0 ? ` [Desconto: ${formatCurrency(discountAmount)}]` : ""}`);
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

  // Debt/Fiado actions
  const registerDebt = async (
    customerName: string,
    items: { id: string; name: string; quantity: number; price_cost: number; price_sell: number }[],
    discountAmount = 0
  ): Promise<boolean> => {
    if (!customerName.trim() || items.length === 0) return false;

    const rawTotal = items.reduce((sum, item) => sum + (item.price_sell * item.quantity), 0);
    const finalAmount = Math.max(0, rawTotal - discountAmount);

    const newDebt: DebtItem = {
      id: `d-${Date.now()}`,
      customer_name: customerName.trim(),
      amount: parseFloat(finalAmount.toFixed(2)),
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price_cost: i.price_cost,
        price_sell: i.price_sell
      })),
      date: new Date().toISOString(),
      status: "pending"
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        const { error } = await client.from("thebest_debts").insert(newDebt);
        if (error) {
          console.error("Erro ao registrar fiado na nuvem:", error.message);
        }
        await deductStockLevels(items, client);
      }
    } else {
      await deductStockLevels(items, null);
    }

    setDebts((prev) => [newDebt, ...prev]);
    logAction(`Registrou fiado pendente para o cliente '${customerName.trim()}' no valor de ${formatCurrency(finalAmount)}`);
    return true;
  };

  const settleDebt = async (id: string, paymentMethod: "pix" | "dinheiro" | "credito" | "debito") => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;

    // Convert debt into a finalized sale
    const totalCost = debt.items.reduce((sum, item) => sum + (item.price_cost * item.quantity), 0);
    const profit = debt.amount - totalCost;

    const newSale: SaleItem = {
      id: `sale-${Date.now()}`,
      items: debt.items,
      total_amount: debt.amount,
      payment_method: paymentMethod,
      profit: parseFloat(profit.toFixed(2)),
      date: new Date().toISOString()
    };

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        // Delete debt and add sale record
        await client.from("thebest_debts").delete().eq("id", id);
        await client.from("thebest_sales").insert(newSale);
      }
    }

    setDebts((prev) => prev.filter((d) => d.id !== id));
    setSales((prev) => [newSale, ...prev]);
    logAction(`Quitou fiado de '${debt.customer_name}' no valor de ${formatCurrency(debt.amount)} via ${paymentMethod.toUpperCase()}`);
  };

  const renameDebtCustomer = async (id: string, newName: string) => {
    const debt = debts.find((d) => d.id === id);
    if (!debt || !newName.trim()) return;

    if (isCloudMode) {
      const client = getSupabaseClient(dbConfig);
      if (client) {
        await client.from("thebest_debts").update({ customer_name: newName.trim() }).eq("id", id);
      }
    }

    setDebts((prev) =>
      prev.map((d) => d.id === id ? { ...d, customer_name: newName.trim() } : d)
    );
    logAction(`Renomeou cliente fiado de '${debt.customer_name}' para '${newName.trim()}'`);
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
        debts,
        currentUser,
        isLoadingData,
        isCloudMode,
        dbConfig,
        dbError,
        isTestingConfig,
        mounted,
        isPosActive,
        setIsPosActive,
        activeCart,
        setActiveCart,
        heldCarts,
        setHeldCarts,
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
        registerDebt,
        settleDebt,
        renameDebtCustomer,
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
