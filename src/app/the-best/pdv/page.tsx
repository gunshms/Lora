"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAdega, StockItem, HeldCart } from "@/context/AdegaContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  DollarSign,
  Check,
  X,
  AlertCircle,
  Settings,
  ArrowRight,
  Lock,
  LockOpen,
  FolderMinus,
  MessageCircle,
  Percent,
  CornerDownLeft,
  Keyboard,
  UserCheck,
  Barcode,
  Layers3,
  Calculator,
  Banknote,
  Activity
} from "lucide-react";
import Image from "next/image";
import { buildProductArtDataUrl, getProductDisplayImage } from "@/lib/theBestProductImages";

type PaymentMethod =
  | "pix"
  | "dinheiro"
  | "credito"
  | "debito"
  | "fiado"
  | "consumo_oliveira"
  | "consumo_marques"
  | "cortesia";

type DirectPaymentMethod = Exclude<PaymentMethod, "dinheiro" | "fiado">;

type ProductQuickFilter = "todos" | "vendaveis" | "recentes" | "sem_preco" | "cervejas" | "destilados" | "outros";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price_cost: number;
  price_sell: number;
  is_returnable?: boolean;
  deposit_fee?: number;
  returned_bottles_count?: number;
}

const normalizeProductText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getProductAvailableQuantity = (product: StockItem, stock: StockItem[]) => {
  if (!product.recipe?.length) return Math.max(0, product.quantity);

  const ingredientLimits = product.recipe.map((ingredient) => {
    const stockItem = stock.find((item) => item.id === ingredient.product_id);
    if (!stockItem || ingredient.quantity <= 0) return 0;
    return Math.floor(stockItem.quantity / ingredient.quantity);
  });

  return ingredientLimits.length > 0 ? Math.max(0, Math.min(...ingredientLimits)) : 0;
};

const isSellableProduct = (product: StockItem, stock: StockItem[]) =>
  getProductAvailableQuantity(product, stock) > 0;

const hasProductPrice = (product: StockItem) => !!product.price_sell && product.price_sell > 0;

const getPdvProductCategory = (name: string): Exclude<ProductQuickFilter, "todos" | "vendaveis" | "recentes" | "sem_preco"> => {
  const lower = normalizeProductText(name);

  if (
    lower.includes("cerveja") ||
    lower.includes("heineken") ||
    lower.includes("budweiser") ||
    lower.includes("amstel") ||
    lower.includes("coron") ||
    lower.includes("skol") ||
    lower.includes("brahma") ||
    lower.includes("original") ||
    lower.includes("stella") ||
    lower.includes("chopp")
  ) {
    return "cervejas";
  }

  if (
    lower.includes("absolut") ||
    lower.includes("smirnoff") ||
    lower.includes("whisky") ||
    lower.includes("gin") ||
    lower.includes("vodka") ||
    lower.includes("jack daniel") ||
    lower.includes("corote") ||
    lower.includes("cachaca") ||
    lower.includes("campari") ||
    lower.includes("rum") ||
    lower.includes("tequila") ||
    lower.includes("licor")
  ) {
    return "destilados";
  }

  return "outros";
};

export default function PdvPage() {
  const {
    stock,
    registerSale,
    registerDebt,
    updateStockPrices,
    isPosActive,
    setIsPosActive,
    activeCart,
    setActiveCart,
    heldCarts,
    setHeldCarts,
    debts,
    currentUser
  } = useAdega();

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState<ProductQuickFilter>("vendaveis");
  const [recentProductIds, setRecentProductIds] = useState<string[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  // Custom discount state
  const [discountVal, setDiscountVal] = useState("");

  // Customer debt state
  const [debtCustomerName, setDebtCustomerName] = useState("");

  // Cash/Change states
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successSaleTotal, setSuccessSaleTotal] = useState(0);
  const [successSaleChange, setSuccessSaleChange] = useState(0);

  // Price adjustment states (for products without prices)
  const [adjustingProduct, setAdjustingProduct] = useState<StockItem | null>(null);
  const [tempPriceCost, setTempPriceCost] = useState("");
  const [tempPriceSell, setTempPriceSell] = useState("");
  const [tempBarcode, setTempBarcode] = useState("");

  // Mobile View state
  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");

  // Session Closing Modal state
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [sessionRevenue, setSessionRevenue] = useState(0);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("thebest_pdv_recent_products");
      if (saved) setRecentProductIds(JSON.parse(saved));
    } catch {
      setRecentProductIds([]);
    }
  }, []);

  const rememberRecentProduct = useCallback((id: string) => {
    setRecentProductIds((previous) => {
      const next = [id, ...previous.filter((productId) => productId !== id)].slice(0, 12);
      window.localStorage.setItem("thebest_pdv_recent_products", JSON.stringify(next));
      return next;
    });
  }, []);

  const productStats = useMemo(() => {
    const stats: Record<ProductQuickFilter, number> = {
      todos: stock.length,
      vendaveis: 0,
      recentes: 0,
      sem_preco: 0,
      cervejas: 0,
      destilados: 0,
      outros: 0,
    };

    stock.forEach((item) => {
      const sellable = isSellableProduct(item, stock);
      if (sellable) stats.vendaveis += 1;
      if (sellable && recentProductIds.includes(item.id)) stats.recentes += 1;
      if (sellable && !hasProductPrice(item)) stats.sem_preco += 1;
      stats[getPdvProductCategory(item.name)] += 1;
    });

    return stats;
  }, [stock, recentProductIds]);

  // Filter & Search stock
  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeProductText(searchTerm);

    return stock.filter((item) => {
      const matchesSearch = normalizeProductText(item.name).includes(normalizedSearch) ||
        (item.barcode && item.barcode.includes(searchTerm));

      const matchesFilter =
        productFilter === "todos" ||
        (productFilter === "vendaveis" && isSellableProduct(item, stock)) ||
        (productFilter === "recentes" && recentProductIds.includes(item.id) && isSellableProduct(item, stock)) ||
        (productFilter === "sem_preco" && isSellableProduct(item, stock) && !hasProductPrice(item)) ||
        getPdvProductCategory(item.name) === productFilter;

      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      if (productFilter === "recentes") {
        return recentProductIds.indexOf(a.id) - recentProductIds.indexOf(b.id);
      }

      const sellableDelta = Number(isSellableProduct(b, stock)) - Number(isSellableProduct(a, stock));
      if (sellableDelta !== 0) return sellableDelta;

      const priceDelta = Number(hasProductPrice(b)) - Number(hasProductPrice(a));
      if (priceDelta !== 0) return priceDelta;

      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [stock, searchTerm, productFilter, recentProductIds]);

  const registerProducts = useMemo(() => {
    const recentItems = recentProductIds
      .map((id) => stock.find((item) => item.id === id))
      .filter((item): item is StockItem => !!item && isSellableProduct(item, stock))
      .slice(0, 8);

    if (recentItems.length > 0) return recentItems;

    return stock
      .filter((item) => isSellableProduct(item, stock) && hasProductPrice(item))
      .sort((a, b) => (b.price_sell || 0) - (a.price_sell || 0))
      .slice(0, 8);
  }, [stock, recentProductIds]);

  const stockAlertCount = useMemo(() => {
    return stock.filter((item) => !item.recipe?.length && item.quantity > 0 && item.quantity <= 3).length;
  }, [stock]);

  const noPriceCount = productStats.sem_preco;

  const cartProfitAmount = useMemo(() => {
    return activeCart.reduce((sum, item) => {
      const unitProfit = (item.price_sell || 0) - (item.price_cost || 0);
      return sum + unitProfit * item.quantity;
    }, 0);
  }, [activeCart]);

  // Totals calculations
  const subtotalAmount = useMemo(() => {
    return activeCart.reduce((sum, item) => {
      const baseTotal = item.price_sell * item.quantity;
      const depositCharge = item.is_returnable
        ? Math.max(0, item.quantity - (item.returned_bottles_count || 0)) * (item.deposit_fee || 0)
        : 0;
      return sum + baseTotal + depositCharge;
    }, 0);
  }, [activeCart]);

  const parsedDiscount = useMemo(() => {
    const val = parseFloat(discountVal.replace(",", "."));
    return isNaN(val) || val < 0 ? 0 : val;
  }, [discountVal]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotalAmount - parsedDiscount);
  }, [subtotalAmount, parsedDiscount]);

  const saleStatusLabel = activeCart.length === 0
    ? "Aguardando produto"
    : parsedDiscount > 0
      ? "Venda com desconto"
      : "Pronta para pagamento";

  const saleStatusClass = activeCart.length === 0
    ? "text-white/45"
    : parsedDiscount > 0
      ? "text-amber-300"
      : "text-emerald-300";

  const activeCustomerDebt = useMemo(() => {
    if (paymentMethod !== "fiado" || !debtCustomerName.trim()) return 0;
    const matchingDebts = debts.filter(d =>
      (d.status === "pending" || !d.status) &&
      d.customer_name.toLowerCase().trim() === debtCustomerName.toLowerCase().trim()
    );
    return matchingDebts.reduce((sum, d) => sum + d.amount, 0);
  }, [paymentMethod, debtCustomerName, debts]);

  const totalItemsCount = useMemo(() => {
    return activeCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [activeCart]);

  const changeAmount = useMemo(() => {
    const received = parseFloat(receivedAmount.replace(",", "."));
    if (isNaN(received) || received <= totalAmount) return 0;
    return received - totalAmount;
  }, [receivedAmount, totalAmount]);

  // Quick cash buttons
  const cashQuickNotes = useMemo(() => {
    const roundedToTen = Math.ceil(totalAmount / 10) * 10;
    const roundedToFifty = Math.ceil(totalAmount / 50) * 50;
    return Array.from(new Set([20, 50, 100, 200, roundedToTen, roundedToFifty]))
      .filter((value) => value > 0 && value >= totalAmount)
      .sort((a, b) => a - b)
      .slice(0, 5);
  }, [totalAmount]);
  const quickDiscounts = [5, 10, 20];
  const directPaymentOptions = [
    { id: "pix", label: "Pix" },
    { id: "debito", label: "Débito" },
    { id: "credito", label: "Crédito" },
  ] satisfies { id: DirectPaymentMethod; label: string }[];

  const productFilterOptions = [
    { id: "vendaveis", label: "Vendáveis", count: productStats.vendaveis },
    { id: "recentes", label: "Recentes", count: productStats.recentes },
    { id: "sem_preco", label: "Precificar", count: productStats.sem_preco },
    { id: "cervejas", label: "Cervejas", count: productStats.cervejas },
    { id: "destilados", label: "Destilados", count: productStats.destilados },
    { id: "outros", label: "Outros", count: productStats.outros },
    { id: "todos", label: "Todos", count: productStats.todos },
  ] satisfies { id: ProductQuickFilter; label: string; count: number }[];

  // Cart actions
  const addToCart = (product: StockItem) => {
    const existing = activeCart.find(item => item.id === product.id);
    const availableQuantity = getProductAvailableQuantity(product, stock);

    if (availableQuantity <= 0) {
      alert(product.recipe?.length
        ? "Combo indisponível: reponha os ingredientes da receita antes de vender."
        : "Produto sem estoque. Reponha no estoque antes de vender.");
      return;
    }

    if (existing && existing.quantity >= availableQuantity) {
      alert("Quantidade indisponível no estoque para este produto.");
      return;
    }

    if (!product.price_sell || product.price_sell <= 0) {
      setAdjustingProduct(product);
      setTempPriceCost(product.price_cost?.toString() || "");
      setTempPriceSell(product.price_sell?.toString() || "");
      setTempBarcode(product.barcode || "");
      return;
    }

    // Check expiration if batches exist - Idea 2
    if (product.batches && product.batches.length > 0) {
      const allExpired = product.batches.every(b => new Date(b.expiration_date) <= new Date());
      if (allExpired) {
        alert("Bloqueado: Todos os lotes deste produto no estoque estão VENCIDOS!");
        return;
      }
    }

    setActiveCart((prev) => {
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          quantity: 1,
          price_cost: product.price_cost || 0,
          price_sell: product.price_sell || 0,
          is_returnable: product.is_returnable,
          deposit_fee: product.deposit_fee,
          returned_bottles_count: product.is_returnable ? 0 : undefined
        }
      ];
    });

    rememberRecentProduct(product.id);
    setMobileTab("cart");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const term = searchTerm.trim();
    const exactBarcode = term
      ? stock.find((item) => item.barcode && item.barcode === term)
      : undefined;
    const productToAdd = exactBarcode || (filteredProducts.length === 1 ? filteredProducts[0] : undefined);

    if (!productToAdd) return;

    e.preventDefault();
    addToCart(productToAdd);
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const adjustCartQty = (id: string, amount: number) => {
    const stockItem = stock.find((item) => item.id === id);

    if (amount > 0 && stockItem) {
      const cartItem = activeCart.find((item) => item.id === id);
      const availableQuantity = getProductAvailableQuantity(stockItem, stock);
      if (cartItem && cartItem.quantity >= availableQuantity) {
        alert("Quantidade indisponível no estoque para este produto.");
        return;
      }
    }

    setActiveCart((prev) =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setActiveCart(prev => prev.filter(item => item.id !== id));
  };

  // Multiple carts held actions
  const minimizeCurrentCart = () => {
    if (activeCart.length === 0) return;

    const nickname = window.prompt("Digite um nome/apelido para esta venda (ex: Balcão 2, João):");
    const cartName = nickname?.trim() || `Carrinho ${heldCarts.length + 1}`;

    const newHeld: HeldCart = {
      id: `held-${Date.now()}`,
      name: cartName,
      items: [...activeCart]
    };

    setHeldCarts(prev => [...prev, newHeld]);
    setActiveCart([]);
  };

  const restoreHeldCart = (held: HeldCart) => {
    // If we have items in active cart, swap them!
    if (activeCart.length > 0) {
      const currentActiveHeld: HeldCart = {
        id: `held-swap-${held.id}`,
        name: `Substituido (${held.name})`,
        items: [...activeCart]
      };
      setHeldCarts(prev => [...prev.filter(c => c.id !== held.id), currentActiveHeld]);
    } else {
      setHeldCarts(prev => prev.filter(c => c.id !== held.id));
    }
    setActiveCart(held.items);
  };

  // Price form save
  const handlePriceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const success = await updateStockPrices(
      adjustingProduct.id,
      tempPriceCost || "0",
      tempPriceSell,
      tempBarcode
    );

    if (success) {
      const updatedProduct = {
        ...adjustingProduct,
        price_cost: parseFloat(tempPriceCost.replace(",", ".")),
        price_sell: parseFloat(tempPriceSell.replace(",", ".")),
        barcode: tempBarcode || undefined
      };
      addToCart(updatedProduct);
      setAdjustingProduct(null);
    } else {
      alert("Erro ao salvar preços no banco de dados. Certifique-se de executar o script SQL de atualização do Supabase.");
    }
  };

  const completeCheckout = useCallback(async (method: PaymentMethod) => {
    if (activeCart.length === 0 || isProcessingCheckout) return;

    const unavailableItem = activeCart.find((cartItem) => {
      const stockItem = stock.find((item) => item.id === cartItem.id);
      return stockItem && cartItem.quantity > getProductAvailableQuantity(stockItem, stock);
    });

    if (unavailableItem) {
      alert(`Estoque insuficiente para ${unavailableItem.name}. Atualize o carrinho antes de finalizar.`);
      return;
    }

    setIsProcessingCheckout(true);

    try {
      let success = false;

      if (method === "fiado") {
        success = await registerDebt(
          debtCustomerName || "Cliente Sem Nome",
          activeCart,
          parsedDiscount
        );
      } else {
        success = await registerSale(
          activeCart,
          method,
          parsedDiscount
        );
      }

      if (success) {
        setSuccessSaleTotal(method.startsWith("consumo") || method === "cortesia" ? 0 : totalAmount);
        setSuccessSaleChange(method === "dinheiro" ? changeAmount : 0);
        setSessionRevenue(prev => prev + (method.startsWith("consumo") || method === "cortesia" ? 0 : totalAmount));
        setActiveCart([]);
        setIsCheckoutOpen(false);
        setReceivedAmount("");
        setDiscountVal("");
        setDebtCustomerName("");
        setIsSuccessOpen(true);
      }
    } finally {
      setIsProcessingCheckout(false);
    }
  }, [
    activeCart,
    changeAmount,
    debtCustomerName,
    isProcessingCheckout,
    parsedDiscount,
    registerDebt,
    registerSale,
    setActiveCart,
    stock,
    totalAmount,
  ]);

  const handleCheckoutSubmit = useCallback(async () => {
    await completeCheckout(paymentMethod);
  }, [completeCheckout, paymentMethod]);

  const handleDirectPayment = useCallback(async (method: DirectPaymentMethod) => {
    setPaymentMethod(method);
    await completeCheckout(method);
  }, [completeCheckout]);

  // Keyboard shortcut listener - Idea 5
  useEffect(() => {
    if (!isPosActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement || document.activeElement instanceof HTMLSelectElement;

      // Global shortcuts
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === "F8") {
        if (activeCart.length > 0) {
          e.preventDefault();
          setIsCheckoutOpen(true);
        }
      } else if (e.key === "F9") {
        if (window.confirm("Deseja realmente esvaziar todo o carrinho atual?")) {
          e.preventDefault();
          setActiveCart([]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsCheckoutOpen(false);
        setAdjustingProduct(null);
      }

      // Checkout drawer specific shortcuts (only if drawer is open)
      if (isCheckoutOpen) {
        const keyUpper = e.key.toUpperCase();
        if (!isInputFocused) {
          if (keyUpper === "P") {
            e.preventDefault();
            setPaymentMethod("pix");
          } else if (keyUpper === "D") {
            e.preventDefault();
            setPaymentMethod("dinheiro");
          } else if (keyUpper === "C") {
            e.preventDefault();
            setPaymentMethod("credito");
          } else if (keyUpper === "V" || keyUpper === "E") {
            e.preventDefault();
            setPaymentMethod("debito");
          } else if (keyUpper === "F") {
            e.preventDefault();
            setPaymentMethod("fiado");
          }
        }

        if (e.key === "Enter") {
          // If in money method and change calculation is ready or other methods
          const isButtonBlocked =
            (paymentMethod === "dinheiro" && (!receivedAmount || changeAmount < 0)) ||
            (paymentMethod === "fiado" && (!debtCustomerName.trim() || activeCustomerDebt >= 150));

          if (!isButtonBlocked) {
            e.preventDefault();
            handleCheckoutSubmit();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPosActive, isCheckoutOpen, activeCart, paymentMethod, receivedAmount, changeAmount, debtCustomerName, activeCustomerDebt, handleCheckoutSubmit, setActiveCart]);

  // Cash Closeout Register summary
  const handleCloseSessionSubmit = () => {
    setIsPosActive(false);
    setIsClosingSession(false);
    setSessionRevenue(0);
    setActiveCart([]);
    setHeldCarts([]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Gatekeeper: If POS is inoperative, block PDV and show glowing red screen
  if (!isPosActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] relative p-6">
        <div className="absolute inset-0 bg-radial-gradient from-rose-500/[0.015] to-transparent pointer-events-none rounded-full blur-3xl animate-pulse" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-sm bg-[#0b0b0d] border border-rose-500/10 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(239,68,68,0.03)] text-center relative overflow-hidden"
        >
          {/* Animated red neon ring */}
          <div className="relative w-20 h-20 bg-rose-500/5 rounded-full flex items-center justify-center border border-rose-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            <Lock className="w-9 h-9 text-rose-500 animate-pulse" />
            <span className="absolute inset-0 rounded-full border border-dashed border-rose-500/25 animate-[spin_60s_linear_infinite]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-headline font-black tracking-widest text-rose-500 uppercase">Caixa Fechado</h2>
            <p className="text-[11px] text-white/40 uppercase font-mono tracking-wider max-w-xs leading-relaxed">
              O caixa operacional está inativo. Inicie o caixa para abrir o catálogo de vendas.
            </p>
          </div>

          {/* Glowing Ligar button */}
          <button
            onClick={() => setIsPosActive(true)}
            className="w-full mt-2 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-headline font-bold text-xs tracking-widest rounded-xl uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_30px_rgba(239,68,68,0.35)] active:scale-[0.98] duration-300"
          >
            Ligar Caixa
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2 flex-1 relative min-h-[calc(100vh-140px)] select-none">

      <header className="rounded-xl border border-white/8 bg-[#09090b] overflow-hidden">
        <div className="flex flex-col gap-4 p-4 lg:p-5">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-[0.22em] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Caixa operando
                </span>
                <h2 className="font-headline text-xl lg:text-2xl font-black tracking-widest text-white mt-1 uppercase">
                  Terminal de venda
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 xl:min-w-[620px]">
              <div className="rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">Operador</span>
                <strong className="mt-1 flex items-center gap-1.5 text-xs text-white">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {currentUser || "Caixa"}
                </strong>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">Venda</span>
                <strong className={`mt-1 block text-xs ${saleStatusClass}`}>{saleStatusLabel}</strong>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">Ticket atual</span>
                <strong className="mt-1 block text-xs text-white">{formatCurrency(totalAmount)}</strong>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">Atenções</span>
                <strong className="mt-1 block text-xs text-amber-300">{stockAlertCount + noPriceCount}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-t border-white/5 pt-3">
            <div className="grid grid-cols-3 gap-2 lg:w-auto">
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-white/45">
                <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
                F2 busca
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-white/45">
                <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                Enter adiciona
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-white/45">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                F8 finaliza
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.confirm("Deseja fechar o caixa e ver o resumo de faturamento da sessão?")) {
                    setIsClosingSession(true);
                  }
                }}
                className="px-4 py-2 border border-rose-500/20 bg-rose-950/10 text-rose-400 font-headline font-bold text-[10px] tracking-wider rounded uppercase hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              >
                Fechar Caixa
              </button>

              <div className="lg:hidden flex bg-[#0c0c0e] border border-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setMobileTab("products")}
                  className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                    mobileTab === "products"
                      ? "bg-white text-black font-semibold"
                      : "text-white/50"
                  }`}
                >
                  Produtos
                </button>
                <button
                  onClick={() => setMobileTab("cart")}
                  className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    mobileTab === "cart"
                      ? "bg-white text-black font-semibold"
                      : "text-white/50"
                  }`}
                >
                  Carrinho ({totalItemsCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-12 gap-4 flex-1 items-start">

        <aside className="hidden xl:flex xl:col-span-2 flex-col gap-4 sticky top-24">
          <section className="rounded-xl border border-white/5 bg-[#0b0b0d] p-3">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Layers3 className="w-4 h-4 text-white/40" />
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/45">Navegação do caixa</h3>
            </div>
            <div className="mt-3 space-y-1.5">
              {productFilterOptions.map((filter) => {
                const active = productFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setProductFilter(filter.id)}
                    className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider transition-colors ${
                      active
                        ? "border-white bg-white text-black font-bold"
                        : "border-white/5 bg-white/[0.015] text-white/45 hover:text-white hover:bg-white/[0.035]"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span>{filter.count}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-white/5 bg-[#0b0b0d] p-3 space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Calculator className="w-4 h-4 text-white/40" />
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/45">Controle</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/5 bg-white/[0.015] p-3">
                <span className="text-[9px] font-mono uppercase text-white/35">Itens</span>
                <strong className="block mt-1 text-lg font-mono text-white">{totalItemsCount}</strong>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.015] p-3">
                <span className="text-[9px] font-mono uppercase text-white/35">Margem</span>
                <strong className="block mt-1 text-sm font-mono text-emerald-300">{formatCurrency(cartProfitAmount)}</strong>
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 text-[10px] font-mono uppercase leading-relaxed text-amber-200/80">
              {noPriceCount} sem preço • {stockAlertCount} com estoque baixo
            </div>
          </section>
        </aside>

        <div className={`lg:col-span-3 xl:col-span-6 space-y-4 rounded-xl border border-white/5 bg-[#080809] p-4 ${mobileTab === "products" ? "block" : "hidden lg:block"}`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar, bipar código ou apertar Enter no único resultado [F2]"
              className="w-full pl-10 pr-4 py-3 bg-[#0b0b0d] border border-white/5 rounded-xl focus:border-white/20 focus:outline-none text-white text-sm placeholder-white/30 transition-all font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3.5 text-white/30 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Floating autocomplete suggestion dropdown list */}
            {searchTerm && filteredProducts.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#0c0c0e]/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-white/5 text-[9px] font-mono text-white/30 uppercase tracking-widest bg-white/[0.005]">
                  Sugestões de Pesquisa (Clique para Adicionar)
                </div>
                <div className="divide-y divide-white/5">
                  {filteredProducts.map((product) => {
                    const isBlockedOutOfStock = !isSellableProduct(product, stock);
                    const availableQuantity = getProductAvailableQuantity(product, stock);

                    return (
                      <button
                        key={product.id}
                        onClick={() => {
                          addToCart(product);
                          setSearchTerm(""); // Auto-clear search bar on selection to make it fast!
                        }}
                        disabled={isBlockedOutOfStock}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-all ${
                          isBlockedOutOfStock
                            ? "cursor-not-allowed opacity-45"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 p-1 overflow-hidden flex items-center justify-center flex-shrink-0">
                            <Image
                              src={getProductDisplayImage(product)}
                              alt={product.name}
                              width={40}
                              height={40}
                              unoptimized
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = buildProductArtDataUrl(product);
                              }}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-xs font-semibold text-white truncate block">{product.name}</span>
                            <span className="text-[10px] font-mono text-white/40 block">
                              {isBlockedOutOfStock
                                ? product.recipe?.length ? "Ingredientes insuficientes" : "Sem estoque"
                                : product.recipe?.length ? `Rende: ${availableQuantity}` : `Estoque: ${availableQuantity}`}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {product.price_sell ? formatCurrency(product.price_sell) : "Precificar"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-white/35" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/45">
                  Produtos e leitura de código
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
                {filteredProducts.length} na tela
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {productFilterOptions.map((filter) => {
                const active = productFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setProductFilter(filter.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-[9px] font-mono uppercase tracking-wider transition-all flex-shrink-0 ${
                      active
                        ? "border-white bg-white text-black font-bold"
                        : "border-white/5 bg-white/[0.02] text-white/50 hover:text-white"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] leading-none ${
                      active ? "bg-black/10 text-black" : "bg-white/5 text-white/35"
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.015] px-3 py-2">
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">
                {filteredProducts.length} produtos na tela
              </span>
              {(searchTerm || productFilter !== "vendaveis") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setProductFilter("vendaveis");
                    searchInputRef.current?.focus();
                  }}
                  className="text-[9px] font-mono uppercase tracking-wider text-white/45 hover:text-white transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {registerProducts.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-[#0b0b0d] p-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">
                    {productStats.recentes > 0 ? "Itens recentes do caixa" : "Itens prováveis para começar"}
                  </span>
                  {productStats.recentes > 0 && (
                    <button
                      type="button"
                      onClick={() => setProductFilter("recentes")}
                      className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/70 hover:text-emerald-300"
                    >
                      Ver recentes
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {registerProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      className="min-h-[58px] rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2 text-left hover:border-white/15 hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-white/80">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-[10px] font-mono text-emerald-400">
                        {product.price_sell ? formatCurrency(product.price_sell) : "Precificar"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2">
              {filteredProducts.map((product) => {
                const availableQuantity = getProductAvailableQuantity(product, stock);
                const isOutOfStock = availableQuantity <= 0;
                const isBlockedOutOfStock = !isSellableProduct(product, stock);
                const hasNoPrice = !product.price_sell || product.price_sell <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isBlockedOutOfStock}
                    className={`grid grid-cols-[52px_1fr_auto] items-center gap-3 text-left bg-[#0b0b0d] border border-white/5 px-3 py-2.5 rounded-xl relative overflow-hidden group transition-all duration-300 ${
                      isBlockedOutOfStock
                        ? "cursor-not-allowed opacity-45"
                        : "hover:border-white/10 active:scale-[0.98]"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-lg bg-black/40 border border-white/10 p-1.5 overflow-hidden flex items-center justify-center group-hover:border-white/20 transition-colors">
                      <Image
                        src={getProductDisplayImage(product)}
                        alt={product.name}
                        width={52}
                        height={52}
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = buildProductArtDataUrl(product);
                        }}
                        className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-white/90 leading-tight group-hover:text-white transition-colors truncate">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isOutOfStock
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-white/5 text-white/50 border-white/5"
                        }`}>
                          {isBlockedOutOfStock
                            ? product.recipe?.length ? "Sem ingredientes" : "Sem estoque"
                            : product.recipe?.length ? `Rende: ${availableQuantity}` : `Qtd: ${availableQuantity}`}
                        </span>
                        {product.barcode && (
                          <span className="text-[9px] font-mono text-white/25 truncate max-w-[150px]">
                            {product.barcode}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex min-w-[86px] justify-end">
                      {hasNoPrice ? (
                        <span className="text-[10px] font-mono text-emerald-400/80 uppercase font-semibold flex items-center gap-1">
                          <Settings className="w-3 h-3 animate-spin" /> Precificar
                        </span>
                      ) : (
                        <span className="font-mono text-sm font-bold text-white">
                          {formatCurrency(product.price_sell || 0)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#0b0b0d] border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="w-8 h-8 text-white/10" />
              <p className="text-xs font-mono uppercase text-white/30 tracking-wider">
                Nenhum produto correspondente encontrado no estoque.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Active Cart (Visible on Desktop OR Mobile if cart tab active) */}
        <div className={`lg:col-span-2 xl:col-span-4 bg-[#0b0b0d] border border-white/5 rounded-xl p-5 flex flex-col justify-between min-h-[50vh] lg:min-h-[calc(100vh-220px)] sticky top-24 shadow-[0_18px_60px_rgba(0,0,0,0.22)] ${
          mobileTab === "cart" ? "block" : "hidden lg:flex"
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/[0.035] border border-white/5 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm tracking-wider text-white uppercase">Pedido atual</h3>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${saleStatusClass}`}>
                    {saleStatusLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeCart.length > 0 && (
                  <>
                    <button
                      onClick={minimizeCurrentCart}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 text-[9px] font-mono uppercase text-white/60 hover:text-white border border-white/5"
                      title="Minimizar carrinho"
                    >
                      <FolderMinus className="w-3 h-3" /> Suspender
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Deseja esvaziar o carrinho atual?")) {
                          setActiveCart([]);
                        }
                      }}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/5 text-[9px] font-mono uppercase text-rose-400/70 hover:text-rose-300 border border-rose-500/10"
                      title="Esvaziar carrinho"
                    >
                      <Trash2 className="w-3 h-3" /> Limpar
                    </button>
                  </>
                )}
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                  {totalItemsCount} Itens
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-lg border border-white/5 bg-white/[0.015] px-3 py-2">
                <span className="text-[9px] font-mono uppercase text-white/35">Subtotal</span>
                <strong className="block mt-1 text-xs font-mono text-white/75">{formatCurrency(subtotalAmount)}</strong>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.015] px-3 py-2">
                <span className="text-[9px] font-mono uppercase text-white/35">Desc.</span>
                <strong className="block mt-1 text-xs font-mono text-emerald-300">{formatCurrency(parsedDiscount)}</strong>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.015] px-3 py-2">
                <span className="text-[9px] font-mono uppercase text-white/35">Lucro</span>
                <strong className="block mt-1 text-xs font-mono text-emerald-300">{formatCurrency(cartProfitAmount)}</strong>
              </div>
            </div>

            {/* Cart Items List */}
            {activeCart.length > 0 ? (
              <div className="space-y-3 max-h-[30vh] lg:max-h-[40vh] overflow-y-auto pr-1">
                {activeCart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center gap-4 px-3 py-2.5 bg-white/[0.01] border border-white/5 rounded-lg group animate-fade-in"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-white/95 truncate">{item.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span className="text-[10px] font-mono text-white/40 block">
                          {formatCurrency(item.price_sell)} c/u
                        </span>
                        {item.is_returnable && (
                          <span className="text-[9px] font-mono text-amber-400 font-semibold border border-amber-400/20 bg-amber-400/5 px-1 rounded">
                            Retornável
                          </span>
                        )}
                      </div>

                      {item.is_returnable && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-amber-400/80">
                          <span>Devolveu Casco:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCart(prev => prev.map(c =>
                                c.id === item.id
                                  ? { ...c, returned_bottles_count: Math.max(0, (c.returned_bottles_count || 0) - 1) }
                                  : c
                              ));
                            }}
                            className="px-1 rounded bg-white/5 hover:bg-white/10 text-white"
                            title="Remover casco devolvido"
                          >
                            -
                          </button>
                          <span className="font-bold text-white px-0.5">{item.returned_bottles_count || 0}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCart(prev => prev.map(c =>
                                c.id === item.id
                                  ? { ...c, returned_bottles_count: Math.min(c.quantity, (c.returned_bottles_count || 0) + 1) }
                                  : c
                              ));
                            }}
                            className="px-1 rounded bg-white/5 hover:bg-white/10 text-white"
                            title="Adicionar casco devolvido"
                          >
                            +
                          </button>
                          {item.quantity - (item.returned_bottles_count || 0) > 0 && (
                            <span className="text-white/40 font-semibold ml-1">
                              (+{formatCurrency((item.quantity - (item.returned_bottles_count || 0)) * (item.deposit_fee || 0))})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-md px-1.5 py-1">
                          <button
                            onClick={() => adjustCartQty(item.id, -1)}
                            className="p-1 rounded text-white/40 hover:text-white transition-colors"
                            title="Diminuir"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="font-mono text-xs font-bold text-white min-w-[16px] text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => adjustCartQty(item.id, 1)}
                            className="p-1 rounded text-white/40 hover:text-white transition-colors"
                            title="Aumentar"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400/80">
                          {formatCurrency(
                            item.price_sell * item.quantity +
                              (item.is_returnable
                                ? Math.max(0, item.quantity - (item.returned_bottles_count || 0)) * (item.deposit_fee || 0)
                                : 0)
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-white/30 font-mono uppercase bg-white/[0.005] border border-dashed border-white/5 rounded-lg">
                Carrinho de caixa vazio.
              </div>
            )}
          </div>

          {/* Cart Bottom Summary */}
          <div className="pt-4 border-t border-white/5 mt-6 space-y-4">

            {/* Custom Discount input */}
            {activeCart.length > 0 && (
              <div className="space-y-2 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Desconto (R$)
                  </span>
                  <input
                    type="text"
                    value={discountVal}
                    onChange={(e) => setDiscountVal(e.target.value)}
                    placeholder="0,00"
                    className="w-20 px-2 py-1 text-xs text-right bg-black/40 border border-white/10 rounded focus:border-white/20 focus:outline-none text-white font-mono placeholder-white/20"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {quickDiscounts.map((discount) => (
                    <button
                      key={discount}
                      type="button"
                      onClick={() => setDiscountVal(discount.toString())}
                      className="rounded border border-white/5 bg-black/20 py-1 text-[9px] font-mono uppercase text-white/45 hover:text-white hover:bg-white/5"
                    >
                      -R$ {discount}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDiscountVal("")}
                    className="rounded border border-white/5 bg-black/20 py-1 text-[9px] font-mono uppercase text-white/45 hover:text-white hover:bg-white/5"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-baseline">
              <span className="text-xs font-mono uppercase text-white/40 tracking-wider">Subtotal</span>
              <span className="text-sm font-mono text-white/70">{formatCurrency(subtotalAmount)}</span>
            </div>

            {parsedDiscount > 0 && (
              <div className="flex justify-between items-baseline text-xs text-emerald-400 font-mono">
                <span>Desconto</span>
                <span>-{formatCurrency(parsedDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline">
              <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-bold">Total Final</span>
              <span className="text-2xl font-mono font-black text-white">{formatCurrency(totalAmount)}</span>
            </div>

            <button
              disabled={activeCart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3 bg-white hover:bg-white/90 disabled:opacity-30 disabled:hover:bg-white text-black font-headline font-bold text-xs tracking-widest rounded-lg uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              <Banknote className="w-4 h-4" />
              Finalizar Compra [F8]
              <ArrowRight className="w-4 h-4" />
            </button>

            {activeCart.length > 0 && (
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.035] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-300/75">
                    Pagamento rápido
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/30">
                    Sem abrir gaveta
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {directPaymentOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleDirectPayment(option.id)}
                      disabled={isProcessingCheckout}
                      className="rounded-lg border border-emerald-500/15 bg-emerald-500/10 px-2 py-2 text-[10px] font-mono uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 disabled:hover:bg-emerald-500/10 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Held/Minimized Carts Floating Bubbles (Chat Bubbles at the bottom) */}
      <AnimatePresence>
        {heldCarts.length > 0 && (
          <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-10 flex flex-col items-end gap-2.5 z-40">
            <span className="text-[9px] font-mono uppercase text-white/40 bg-black/80 px-2 py-0.5 rounded border border-white/5 select-none tracking-wider">
              Vendas Suspensas ({heldCarts.length})
            </span>
            <div className="flex flex-wrap gap-2.5 justify-end">
              {heldCarts.map((held) => {
                const heldTotal = held.items.reduce((sum, item) => sum + (item.price_sell * item.quantity), 0);
                return (
                  <motion.button
                    key={held.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => restoreHeldCart(held)}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-mono transition-all shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                    title={`Recuperar: ${held.name} (${formatCurrency(heldTotal)})`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="font-semibold">{held.name}</span>
                    <span className="text-white/40">| {formatCurrency(heldTotal)}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Drawer */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end bg-black/60 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0"
            />
            {/* Checkout Form */}
            <motion.div
              initial={{ translateY: "100%" }}
              animate={{ translateY: 0 }}
              exit={{ translateY: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative bg-[#0e0e10] p-6 flex flex-col z-10 shadow-2xl justify-between w-full h-[85vh] lg:h-full lg:max-w-md lg:border-l lg:border-white/10 rounded-t-2xl lg:rounded-t-none"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white uppercase">Checkout Venda</h3>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1 rounded text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Total summary */}
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-white/40 tracking-wider">Líquido Final</span>
                    <span className="text-xl font-mono font-black text-emerald-400">{formatCurrency(totalAmount)}</span>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block font-bold">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { id: "pix", label: "Pix [P]" },
                        { id: "dinheiro", label: "Dinheiro [D]" },
                        { id: "credito", label: "Crédito [C]" },
                        { id: "debito", label: "Débito [E]" },
                        { id: "fiado", label: "Fiado [F]" },
                        { id: "consumo_oliveira", label: "Consumo Oliveira" },
                        { id: "consumo_marques", label: "Consumo Marques" },
                        { id: "cortesia", label: "Cortesia" }
                      ] satisfies { id: PaymentMethod; label: string }[]).map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider border transition-all duration-300 font-semibold ${
                            paymentMethod === method.id
                              ? "bg-white text-black border-white shadow-lg"
                              : "bg-[#0b0b0d] border-white/5 text-white/40 hover:text-white/70"
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cash Change Panel */}
                  {paymentMethod === "dinheiro" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 pt-2"
                    >
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Valor Recebido (R$)</label>
                        <input
                          type="text"
                          required
                          value={receivedAmount}
                          onChange={(e) => setReceivedAmount(e.target.value)}
                          placeholder="0,00"
                          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-white/30 focus:outline-none text-white text-sm font-mono placeholder-white/20"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setReceivedAmount(totalAmount.toFixed(2).replace(".", ","))}
                          className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/15 rounded-lg text-xs font-mono text-emerald-300"
                        >
                          Exato
                        </button>
                        {cashQuickNotes.map(note => (
                          <button
                            key={note}
                            type="button"
                            onClick={() => setReceivedAmount(note.toString())}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white/80"
                          >
                            R$ {note}
                          </button>
                        ))}
                      </div>

                      {changeAmount > 0 && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col justify-center items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">TROCO DEVOLUÇÃO</span>
                          <span className="text-3xl font-mono font-black text-emerald-400">{formatCurrency(changeAmount)}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Customer Debt Panel ("Fiado") */}
                  {paymentMethod === "fiado" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 pt-2"
                    >
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Nome do Cliente (Devedor)</label>
                        <input
                          type="text"
                          required
                          value={debtCustomerName}
                          onChange={(e) => setDebtCustomerName(e.target.value)}
                          placeholder="Ex: João Silva, Amigo do Bairro"
                          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-white/30 focus:outline-none text-white text-sm placeholder-white/20 font-mono"
                        />
                      </div>

                      {/* Score / Warning system */}
                      {debtCustomerName.trim() && activeCustomerDebt > 0 && (
                        <div className={`p-3 rounded-lg border text-[10px] font-mono uppercase leading-relaxed ${
                          activeCustomerDebt >= 150
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                          <div className="font-bold flex items-center gap-1.5 mb-0.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {activeCustomerDebt >= 150 ? "Bloqueado / Limite Excedido" : "Cliente com Débito Pendente"}
                          </div>
                          Débito acumulado: <span className="font-bold">{formatCurrency(activeCustomerDebt)}</span>.
                          {activeCustomerDebt >= 150 ? " Novas vendas a prazo estão suspensas para este CPF/nome." : " Proceda com atenção."}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-white/5 mt-auto">
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={
                    isProcessingCheckout ||
                    (paymentMethod === "dinheiro" && (!receivedAmount || changeAmount < 0)) ||
                    (paymentMethod === "fiado" && (!debtCustomerName.trim() || activeCustomerDebt >= 150))
                  }
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black font-headline font-bold text-xs tracking-widest rounded-xl uppercase transition-all shadow-lg shadow-emerald-500/10"
                >
                  {isProcessingCheckout ? "Processando..." : "Confirmar Pagamento"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Price dialog for items without prices */}
      <AnimatePresence>
        {adjustingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e0e10] border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative"
            >
              <button
                onClick={() => setAdjustingProduct(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-emerald-400 animate-spin" />
                <div>
                  <h3 className="font-headline text-base tracking-wider font-bold uppercase">Precificar Produto</h3>
                  <p className="text-xs text-white/40">Defina os valores de custo e venda de <strong>{adjustingProduct.name}</strong> para o PDV.</p>
                </div>
              </div>

              <form onSubmit={handlePriceSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Custo de Compra (R$)</label>
                    <input
                      type="text"
                      required
                      value={tempPriceCost}
                      onChange={(e) => setTempPriceCost(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg focus:border-white/30 focus:outline-none text-white font-mono placeholder-white/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Preço de Venda (R$)</label>
                    <input
                      type="text"
                      required
                      value={tempPriceSell}
                      onChange={(e) => setTempPriceSell(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg focus:border-white/30 focus:outline-none text-white font-mono placeholder-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Código de Barras (Opcional)</label>
                  <input
                    type="text"
                    value={tempBarcode}
                    onChange={(e) => setTempBarcode(e.target.value)}
                    placeholder="789..."
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg focus:border-white/30 focus:outline-none text-white font-mono placeholder-white/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-black font-headline font-bold text-xs tracking-wider rounded-lg uppercase hover:bg-white/90 transition-all shadow-lg"
                >
                  Confirmar e Adicionar
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full screen success modal */}
      <AnimatePresence>
        {isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#0c0c0e] border border-white/10 rounded-2xl p-8 text-center text-white shadow-2xl relative flex flex-col items-center gap-6"
            >
              <div className="relative w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <Check className="w-10 h-10 text-emerald-400" />
                <span className="absolute inset-0 rounded-full border border-dashed border-emerald-500/20 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="font-headline text-lg font-bold tracking-widest text-emerald-400 uppercase">Venda Confirmada!</h3>
                <p className="text-xs text-white/50 uppercase font-mono">ESTOQUE ABATIDO EM TEMPO REAL</p>
              </div>

              <div className="w-full border-t border-b border-white/5 py-4 space-y-2">
                <div className="flex justify-between text-xs font-mono text-white/40 uppercase">
                  <span>Faturado Liquido</span>
                  <span className="text-white font-bold">{formatCurrency(successSaleTotal)}</span>
                </div>
                {successSaleChange > 0 && (
                  <div className="flex justify-between text-xs font-mono text-emerald-400 uppercase">
                    <span>Troco Devolvido</span>
                    <span className="font-bold">{formatCurrency(successSaleChange)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsSuccessOpen(false)}
                className="w-full py-3 bg-white text-black font-headline font-bold text-xs tracking-wider rounded-xl uppercase hover:bg-white/90 transition-all shadow-lg"
              >
                Próxima Venda
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Close session summary modal (Fechar Caixa) */}
      <AnimatePresence>
        {isClosingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0e0e10] border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <LockOpen className="w-6 h-6 text-rose-500 animate-pulse" />
                <div>
                  <h3 className="font-headline text-base tracking-wider font-bold uppercase text-white">Fechar Turno de Caixa</h3>
                  <p className="text-[10px] text-white/40 uppercase font-mono">Resumo do Período de Atendimento</p>
                </div>
              </div>

              <div className="space-y-4 py-2">
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm">
                  <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">FATURAMENTO ACUMULADO</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">{formatCurrency(sessionRevenue)}</span>
                </div>

                <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-mono text-rose-300 leading-relaxed uppercase">
                    Ao confirmar, o caixa operacional será desligado, redefinindo as sessões ativas e limpando os carrinhos que não foram suspensos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsClosingSession(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono uppercase font-bold text-white transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCloseSessionSubmit}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-headline font-bold text-xs tracking-wider rounded-xl uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  Desligar Caixa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
