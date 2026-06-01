"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAdega, StockItem } from "@/context/AdegaContext";
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
  Sparkles, 
  AlertCircle, 
  Settings,
  ArrowRight,
  TrendingUp
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price_cost: number;
  price_sell: number;
}

export default function PdvPage() {
  const { stock, registerSale, updateStockPrices } = useAdega();

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "dinheiro" | "credito" | "debito">("pix");
  
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

  // Filter & Search stock
  const filteredProducts = useMemo(() => {
    return stock.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.barcode && item.barcode.includes(searchTerm))
    );
  }, [stock, searchTerm]);

  // Totals calculations
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price_sell * item.quantity), 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const changeAmount = useMemo(() => {
    const received = parseFloat(receivedAmount.replace(",", "."));
    if (isNaN(received) || received <= totalAmount) return 0;
    return received - totalAmount;
  }, [receivedAmount, totalAmount]);

  // Quick cash buttons
  const cashQuickNotes = [20, 50, 100, 200];

  // Cart actions
  const addToCart = (product: StockItem) => {
    // If the product doesn't have prices defined yet, open the pricing dialog
    if (!product.price_sell || product.price_sell <= 0) {
      setAdjustingProduct(product);
      setTempPriceCost(product.price_cost?.toString() || "");
      setTempPriceSell(product.price_sell?.toString() || "");
      setTempBarcode(product.barcode || "");
      return;
    }

    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
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
          price_sell: product.price_sell || 0
        }
      ];
    });
  };

  const adjustCartQty = (id: string, amount: number) => {
    setCart((prev) => 
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
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Price adjustment form submit
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
      // Re-fetch product to get the newly added prices and add to cart
      const updatedProduct = {
        ...adjustingProduct,
        price_cost: parseFloat(tempPriceCost.replace(",", ".")),
        price_sell: parseFloat(tempPriceSell.replace(",", ".")),
        barcode: tempBarcode || undefined
      };
      addToCart(updatedProduct);
      setAdjustingProduct(null);
    }
  };

  // Checkout submission
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;

    const success = await registerSale(
      cart.map(c => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        price_cost: c.price_cost,
        price_sell: c.price_sell
      })),
      paymentMethod
    );

    if (success) {
      setSuccessSaleTotal(totalAmount);
      setSuccessSaleChange(paymentMethod === "dinheiro" ? changeAmount : 0);
      setCart([]);
      setIsCheckoutOpen(false);
      setReceivedAmount("");
      setIsSuccessOpen(true);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6 py-2 flex flex-col flex-1 relative min-h-[calc(100vh-140px)]">
      
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <span className="text-xs font-mono uppercase text-emerald-400 tracking-[0.2em] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Caixa Operacional
          </span>
          <h2 className="font-headline text-2xl font-black tracking-widest text-white mt-1 uppercase">
            FRENTE DE CAIXA
          </h2>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex bg-[#0c0c0e] border border-white/5 p-1 rounded-lg">
          <button 
            onClick={() => setMobileTab("products")}
            className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${
              mobileTab === "products" 
                ? "bg-white text-black font-semibold" 
                : "text-white/50"
            }`}
          >
            Produtos ({filteredProducts.length})
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

      {/* Main Side-by-side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1 items-start">
        
        {/* Left Side: Product Selector (Visible on Desktop OR Mobile if products tab active) */}
        <div className={`lg:col-span-3 space-y-6 ${mobileTab === "products" ? "block" : "hidden lg:block"}`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por bebida, código de barras..."
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
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-2">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.quantity <= 0;
                const hasNoPrice = !product.price_sell || product.price_sell <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex flex-col text-left bg-[#0b0b0d] border border-white/5 hover:border-white/10 p-4 rounded-xl relative overflow-hidden group transition-all duration-300 active:scale-[0.98]"
                  >
                    {/* Header info */}
                    <div className="flex justify-between items-start w-full gap-2 mb-4">
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isOutOfStock 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : "bg-white/5 text-white/50 border-white/5"
                      }`}>
                        {isOutOfStock ? "Sem estoque" : `Qtd: ${product.quantity}`}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-sm text-white/90 leading-tight group-hover:text-white transition-colors mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    {/* Price Tag */}
                    <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between w-full">
                      {hasNoPrice ? (
                        <span className="text-[10px] font-mono text-emerald-400/80 uppercase font-semibold flex items-center gap-1">
                          <Settings className="w-3 h-3" /> Precificar
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
                Nenhum produto correspondente encontrado.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Active Cart (Visible on Desktop OR Mobile if cart tab active) */}
        <div className={`lg:col-span-2 bg-[#0b0b0d] border border-white/5 rounded-xl p-5 flex flex-col justify-between min-h-[50vh] lg:min-h-[60vh] sticky top-28 ${
          mobileTab === "cart" ? "block" : "hidden lg:flex"
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-white/50" />
                <h3 className="font-headline font-bold text-sm tracking-wider text-white uppercase">Sua Venda</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                {totalItemsCount} Itens
              </span>
            </div>

            {/* Cart Items List */}
            {cart.length > 0 ? (
              <div className="space-y-3 max-h-[35vh] lg:max-h-[45vh] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex justify-between items-center gap-4 px-3 py-2.5 bg-white/[0.01] border border-white/5 rounded-lg group"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-white/95 truncate">{item.name}</h4>
                      <span className="text-[10px] font-mono text-white/40 block">
                        {formatCurrency(item.price_sell)} c/u
                      </span>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center gap-3">
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
                Carrinho de vendas vazio.
              </div>
            )}
          </div>

          {/* Cart Bottom Summary */}
          <div className="pt-4 border-t border-white/5 mt-6 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-mono uppercase text-white/40 tracking-wider">Total a Pagar</span>
              <span className="text-2xl font-mono font-black text-white">{formatCurrency(totalAmount)}</span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3 bg-white hover:bg-white/90 disabled:opacity-30 disabled:hover:bg-white text-black font-headline font-bold text-xs tracking-widest rounded-xl uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              Finalizar Venda
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Checkout Drawer (Slides from bottom on Mobile, right on Desktop) */}
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
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white uppercase">PAGAMENTO</h3>
                  </div>
                  <button 
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1 rounded text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Total summary */}
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-white/40 tracking-wider">Total do Cupom</span>
                    <span className="text-xl font-mono font-black text-white">{formatCurrency(totalAmount)}</span>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block font-bold">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "pix", label: "Pix" },
                        { id: "dinheiro", label: "Dinheiro" },
                        { id: "credito", label: "Crédito" },
                        { id: "debito", label: "Débito" }
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider border transition-all duration-300 font-semibold ${
                            paymentMethod === method.id 
                              ? "bg-white text-black border-white shadow-lg shadow-white/5" 
                              : "bg-[#0b0b0d] border-white/5 text-white/40 hover:text-white/70"
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cash Change Panel (Only shows if paymentMethod === "dinheiro") */}
                  {paymentMethod === "dinheiro" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 pt-2"
                    >
                      {/* Input received amount */}
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

                      {/* Quick Notes buttons */}
                      <div className="flex gap-2">
                        {cashQuickNotes.map(note => (
                          <button
                            key={note}
                            onClick={() => setReceivedAmount(note.toString())}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white/80"
                          >
                            R$ {note}
                          </button>
                        ))}
                      </div>

                      {/* Change display */}
                      {changeAmount > 0 && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col justify-center items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider">TROCO DEVOLUÇÃO</span>
                          <span className="text-2xl font-mono font-black text-emerald-400">{formatCurrency(changeAmount)}</span>
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
                  disabled={paymentMethod === "dinheiro" && (!receivedAmount || changeAmount < 0)}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black font-headline font-bold text-xs tracking-widest rounded-xl uppercase transition-all shadow-lg shadow-emerald-500/10"
                >
                  Confirmar Pagamento
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
                <Settings className="w-6 h-6 text-emerald-400" />
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
              {/* Checkmark animation */}
              <div className="relative w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                <Check className="w-10 h-10 text-emerald-400" />
                <span className="absolute inset-0 rounded-full border border-dashed border-emerald-500/20 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="font-headline text-lg font-bold tracking-widest text-emerald-400 uppercase">VENDA EFETUADA!</h3>
                <p className="text-xs text-white/50 uppercase font-mono">ESTOQUE ABATIDO COM SUCESSO</p>
              </div>

              <div className="w-full border-t border-b border-white/5 py-4 space-y-2">
                <div className="flex justify-between text-xs font-mono text-white/40 uppercase">
                  <span>Valor Recebido</span>
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
                Nova Venda
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
