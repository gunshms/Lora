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
  DollarSign,
  Edit2,
  Share2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EstoquePage() {
  const { 
    stock, 
    addStock, 
    adjustStockQty, 
    toggleStockStatus, 
    deleteStock,
    updateStockPrices,
    addCost
  } = useAdega();

  const [isAddingStock, setIsAddingStock] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Form inputs (Adding)
  const [stockName, setStockName] = useState("");
  const [stockQty, setStockQty] = useState(1);
  const [stockStatus, setStockStatus] = useState<"urgent" | "planned" | "in_stock">("planned");
  const [priceCost, setPriceCost] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [barcode, setBarcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Form inputs (Editing)
  const [editName, setEditName] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editSell, setEditSell] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editStatus, setEditStatus] = useState<"urgent" | "planned" | "in_stock">("planned");
  const [editImageUrl, setEditImageUrl] = useState("");
  
  // Returnable and Batches edit states - Idea 1 & 2
  const [editIsReturnable, setEditIsReturnable] = useState(false);
  const [editDepositFee, setEditDepositFee] = useState("");
  const [editBatches, setEditBatches] = useState<{ lot_number: string; expiration_date: string; quantity: number }[]>([]);
  
  // New lot addition states
  const [newLotNumber, setNewLotNumber] = useState("");
  const [newLotExpirationDate, setNewLotExpirationDate] = useState("");
  const [newLotQuantity, setNewLotQuantity] = useState(1);

  // Markup Calculator states - Idea 3
  const [calcCustoBruto, setCalcCustoBruto] = useState("");
  const [calcFrete, setCalcFrete] = useState("");
  const [calcImpostos, setCalcImpostos] = useState("");
  const [calcMargem, setCalcMargem] = useState("35"); // Default 35% margin

  // XML Import states - Idea 4
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlFileName, setXmlFileName] = useState("");
  const [xmlItems, setXmlItems] = useState<{ name: string; barcode: string; quantity: number; cost: number; matches_product_id?: string }[]>([]);
  const [xmlTotalValue, setXmlTotalValue] = useState(0);

  // Recipe Composer states
  const [editRecipe, setEditRecipe] = useState<{ product_id: string; quantity: number }[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [ingredientQty, setIngredientQty] = useState("0.25");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName.trim() || stockQty <= 0) return;

    const success = await addStock(stockName, stockQty, stockStatus, priceCost, priceSell, barcode, false, "", [], imageUrl);
    if (success) {
      setStockName("");
      setStockQty(1);
      setStockStatus("planned");
      setPriceCost("");
      setPriceSell("");
      setBarcode("");
      setImageUrl("");
      setIsAddingStock(false);
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingProduct(item);
    setEditName(item.name);
    setEditCost(item.price_cost?.toString() || "");
    setEditSell(item.price_sell?.toString() || "");
    setEditBarcode(item.barcode || "");
    setEditStatus(item.status);
    setEditImageUrl(item.image_url || "");
    setEditRecipe(item.recipe || []);
    setSelectedIngredientId("");
    setIngredientQty("0.25");
    
    // Load returnable and batches
    setEditIsReturnable(!!item.is_returnable);
    setEditDepositFee(item.deposit_fee?.toString() || "");
    setEditBatches(item.batches || []);

    // Reset lot addition inputs
    setNewLotNumber("");
    setNewLotExpirationDate("");
    setNewLotQuantity(1);

    // Reset markup calc inputs
    setCalcCustoBruto(item.price_cost?.toString() || "");
    setCalcFrete("");
    setCalcImpostos("");
    setCalcMargem("35");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim() || !editSell) return;

    const success = await updateStockPrices(
      editingProduct.id,
      editCost || "0",
      editSell,
      editBarcode,
      editName,
      editStatus,
      editRecipe,
      editIsReturnable,
      editDepositFee,
      editBatches,
      editImageUrl
    );

    if (success) {
      setEditingProduct(null);
    } else {
      alert("Erro ao salvar alterações no banco de dados. Certifique-se de executar o script SQL no Supabase.");
    }
  };

  const handleAddIngredient = () => {
    if (!selectedIngredientId) return;
    const parsedQty = parseFloat(ingredientQty.replace(",", "."));
    if (isNaN(parsedQty) || parsedQty <= 0) return;

    if (selectedIngredientId === editingProduct?.id) {
      alert("Um combo não pode conter ele mesmo como ingrediente.");
      return;
    }

    if (editRecipe.some(ing => ing.product_id === selectedIngredientId)) {
      alert("Este ingrediente já faz parte da receita.");
      return;
    }

    setEditRecipe(prev => [...prev, { product_id: selectedIngredientId, quantity: parsedQty }]);
    setSelectedIngredientId("");
  };

  const handleRemoveIngredient = (productId: string) => {
    setEditRecipe(prev => prev.filter(ing => ing.product_id !== productId));
  };

  const handleXmlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setXmlFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(event.target?.result as string, "application/xml");

        // Parse Total Value
        const vNFNode = xmlDoc.getElementsByTagName("vNF")[0];
        const totalValue = vNFNode ? parseFloat(vNFNode.textContent || "0") : 0;
        setXmlTotalValue(totalValue);

        // Parse Items
        const detNodes = xmlDoc.getElementsByTagName("det");
        const itemsList: any[] = [];

        for (let i = 0; i < detNodes.length; i++) {
          const det = detNodes[i];
          const xProdNode = det.getElementsByTagName("xProd")[0];
          const cEANNode = det.getElementsByTagName("cEAN")[0];
          const qComNode = det.getElementsByTagName("qCom")[0];
          const vUnComNode = det.getElementsByTagName("vUnCom")[0];

          const name = xProdNode ? xProdNode.textContent || "Produto Sem Nome" : "Produto Sem Nome";
          const ean = cEANNode && cEANNode.textContent !== "SEM GTIN" ? cEANNode.textContent || "" : "";
          const qty = qComNode ? parseFloat(qComNode.textContent || "1") : 1;
          const cost = vUnComNode ? parseFloat(vUnComNode.textContent || "0") : 0;

          // Fuzzy match on stock products
          const matchedProduct = stock.find(s => 
            (ean && s.barcode === ean) || 
            s.name.toLowerCase().trim() === name.toLowerCase().trim()
          );

          itemsList.push({
            name,
            barcode: ean,
            quantity: qty,
            cost,
            matches_product_id: matchedProduct?.id || undefined
          });
        }

        setXmlItems(itemsList);
        setIsXmlModalOpen(true);
      } catch (err) {
        alert("Erro ao ler ou processar o XML da Nota Fiscal. Verifique se o arquivo é um XML de NF-e válido.");
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmXmlImport = async () => {
    setIsXmlModalOpen(false);
    
    // Add variable cost of the invoice to finances!
    const noteDescription = `Entrada Nota (XML: ${xmlFileName.split(".xml")[0]})`;
    await addCost(noteDescription, xmlTotalValue.toFixed(2), "melhor", true);

    let successCount = 0;

    for (const item of xmlItems) {
      if (item.matches_product_id) {
        // Update existing product quantity & cost!
        const existingProduct = stock.find(s => s.id === item.matches_product_id);
        if (existingProduct) {
          const currentQty = existingProduct.quantity;
          
          await updateStockPrices(
            existingProduct.id,
            item.cost.toString(),
            existingProduct.price_sell?.toString() || "0",
            existingProduct.barcode,
            existingProduct.name,
            existingProduct.status,
            existingProduct.recipe,
            existingProduct.is_returnable,
            existingProduct.deposit_fee?.toString() || "",
            existingProduct.batches
          );

          // Update actual quantity count
          await adjustStockQty(existingProduct.id, item.quantity);
          successCount++;
        }
      } else {
        // Create new planned stock product
        await addStock(
          item.name,
          item.quantity,
          "planned",
          item.cost.toString(),
          "0",
          item.barcode
        );
        successCount++;
      }
    }

    alert(`Sucesso! Nota fiscal processada: ${successCount} produtos importados/atualizados e custo de ${formatCurrency(xmlTotalValue)} registrado.`);
    
    // Reset file input
    const inputElement = document.getElementById("xml-upload-input") as HTMLInputElement;
    if (inputElement) inputElement.value = "";
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

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const url = `${window.location.origin}/the-best/catalogo`;
              navigator.clipboard.writeText(url);
              alert("Link do Cardápio Online copiado para a área de transferência!");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5 text-white/80 font-semibold font-headline text-xs tracking-wider rounded uppercase hover:bg-white/10 hover:text-white transition-all duration-300"
            title="Copiar link para o cardápio público"
          >
            <Share2 className="w-4 h-4 text-amber-400 animate-pulse" />
            Copiar Cardápio
          </button>

          {/* Hidden XML input - Idea 4 */}
          <input 
            type="file" 
            id="xml-upload-input" 
            accept=".xml" 
            className="hidden" 
            onChange={handleXmlImport} 
          />
          <label 
            htmlFor="xml-upload-input"
            className="flex items-center gap-2 px-4 py-2 border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-semibold font-headline text-xs tracking-wider rounded uppercase hover:bg-emerald-500/20 cursor-pointer transition-all duration-300"
          >
            <ShoppingBag className="w-4 h-4" />
            Importar XML
          </label>

          <button 
            onClick={() => setIsAddingStock(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold font-headline text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </button>
        </div>
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
                className="bg-[#0b0b0d] border border-white/5 rounded-xl p-5 relative overflow-hidden group flex flex-col sm:flex-row gap-5 hover:border-white/10 transition-all duration-300 min-h-[170px]"
              >
                {/* Decorative Wave Background Watermark */}
                <div className="absolute right-[-10px] bottom-[-10px] w-20 h-20 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 select-none">
                  <Image 
                    src="/adega/crest_white.png" 
                    alt="Wave watermark" 
                    width={80} 
                    height={80} 
                    className="object-contain invert"
                  />
                </div>

                {/* Left Side: Large Premium Product Image Frame */}
                <div className="w-full sm:w-28 h-28 sm:h-28 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center p-2 flex-shrink-0 relative overflow-hidden group-hover:border-amber-500/20 transition-all duration-300">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Beer className="w-10 h-10 text-white/20" />
                  )}
                </div>

                {/* Right Side: Product Details & Controls */}
                <div className="flex-1 flex flex-col justify-between space-y-4 relative z-10 min-w-0">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="font-headline font-bold text-sm tracking-wide text-white leading-tight group-hover:text-white transition-colors block truncate uppercase">
                          {item.name}
                        </span>
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          {/* Returnable Badge */}
                          {item.is_returnable && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-400/20">
                              Retornável (Vasco: {formatCurrency(item.deposit_fee)})
                            </span>
                          )}

                          {/* Expiration warning indicator */}
                          {(() => {
                            if (!item.batches || item.batches.length === 0) return null;
                            const now = new Date();
                            const expired = item.batches.some(b => new Date(b.expiration_date) <= now);
                            const soon = item.batches.some(b => {
                              const exp = new Date(b.expiration_date);
                              const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                              return diffDays > 0 && diffDays <= 30;
                            });

                            if (expired) {
                              return (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/25 animate-pulse">
                                  Vencido ⚠️
                                </span>
                              );
                            } else if (soon) {
                              return (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">
                                  Vence Breve ⏳
                                </span>
                              );
                            }
                            return (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Validade Ok ✅
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <button 
                        onClick={() => toggleStockStatus(item.id)}
                        className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider rounded border font-semibold flex-shrink-0 transition-all duration-300 ${config.styles}`}
                        title="Clique para mudar status"
                      >
                        {config.label}
                      </button>
                    </div>

                    {/* Pricing info */}
                    <div className="grid grid-cols-2 gap-4 py-1.5 border-t border-b border-white/5 text-[9px] font-mono uppercase text-white/40">
                      <div>
                        <span>Custo</span>
                        <span className="block text-white font-bold mt-0.5">{formatCurrency(item.price_cost)}</span>
                      </div>
                      <div>
                        <span>Venda</span>
                        <span className="block text-emerald-400 font-bold mt-0.5">{formatCurrency(item.price_sell)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity adjustments & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-lg px-2 py-0.5">
                      <button 
                        onClick={() => adjustStockQty(item.id, -1)}
                        className="p-0.5 rounded text-white/40 hover:text-white transition-colors"
                        title="Diminuir"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      
                      <span className="font-mono text-xs font-bold text-white min-w-[18px] text-center">
                        {item.quantity}
                      </span>

                      <button 
                        onClick={() => adjustStockQty(item.id, 1)}
                        className="p-0.5 rounded text-white/40 hover:text-white transition-colors"
                        title="Aumentar"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {(item.status === "urgent" || item.quantity < 5) && (
                        <Link 
                          href={`/the-best/custos?autoDesc=Reposição de ${item.name}&autoVal=${item.price_cost || 0}`}
                          className="p-1 rounded hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                          title="Lançar custo de reposição"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </Link>
                      )}
                      <button 
                        onClick={() => handleStartEdit(item)}
                        className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        title="Editar dados e preços"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => deleteStock(item.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                        title="Excluir item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
              className={`relative bg-[#0e0e10] p-6 flex flex-col z-10 shadow-2xl justify-between overflow-y-auto ${
                isMobile 
                  ? "w-full h-[90vh] rounded-t-2xl border-t border-white/10" 
                  : "w-full max-w-md h-full border-l border-white/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white uppercase">ADICIONAR PRODUTO</h3>
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
                      placeholder="Ex: Cerveja Heineken 600ml..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Qtd Inicial</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={stockQty}
                        onChange={(e) => setStockQty(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Código de Barras</label>
                      <input 
                        type="text" 
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Código EAN..."
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Preço de Custo (R$)</label>
                      <input 
                        type="text" 
                        value={priceCost}
                        onChange={(e) => setPriceCost(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Preço de Venda (R$)</label>
                      <input 
                        type="text" 
                        value={priceSell}
                        onChange={(e) => setPriceSell(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block">Status Inicial</label>
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

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">URL da Imagem (Thumbnail)</label>
                    <input 
                      type="url" 
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-6 py-2.5 bg-white text-black font-headline font-bold text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
                  >
                    Adicionar ao Estoque
                  </button>
                </form>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-start gap-2.5 mt-6">
                <AlertCircle className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-white/50 leading-relaxed uppercase">
                  O produto será adicionado ao estoque geral e poderá ser configurado como retornável ou associado a lotes posteriormente na aba de edição.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Stock Sidebar Drawer (Including Recipe/Combo Composer) */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end bg-black/60 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0"
            />
            {/* Drawer */}
            <motion.div 
              initial={isMobile ? { translateY: "100%", translateX: 0 } : { translateX: "100%", translateY: 0 }}
              animate={isMobile ? { translateY: 0, translateX: 0 } : { translateX: 0, translateY: 0 }}
              exit={isMobile ? { translateY: "100%", translateX: 0 } : { translateX: "100%", translateY: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`relative bg-[#0e0e10] p-6 flex flex-col z-10 shadow-2xl justify-between overflow-y-auto ${
                isMobile 
                  ? "w-full h-[90vh] rounded-t-2xl border-t border-white/10" 
                  : "w-full max-w-md h-full border-l border-white/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white uppercase">EDITAR PRODUTO</h3>
                  </div>
                  <button 
                    onClick={() => setEditingProduct(null)}
                    className="p-1 rounded text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Nome da Bebida / Produto</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome da bebida..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Preço de Custo (R$)</label>
                      <input 
                        type="text" 
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Preço de Venda (R$)</label>
                      <input 
                        type="text" 
                        required
                        value={editSell}
                        onChange={(e) => setEditSell(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Código de Barras</label>
                    <input 
                      type="text" 
                      value={editBarcode}
                      onChange={(e) => setEditBarcode(e.target.value)}
                      placeholder="Código de barras..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block">Status do Estoque</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "urgent", label: "Urgente" },
                        { id: "planned", label: "Planejado" },
                        { id: "in_stock", label: "Em Estoque" },
                      ].map((statusOption) => (
                        <button 
                          key={statusOption.id}
                          type="button"
                          onClick={() => setEditStatus(statusOption.id as any)}
                          className={`py-2 px-3 rounded text-[10px] font-mono uppercase border transition-all duration-300 font-semibold ${
                            editStatus === statusOption.id 
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

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">URL da Imagem (Thumbnail)</label>
                    <input 
                      type="url" 
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>

                  {/* RETORNÁVEIS - Idea 1 */}
                  <div className="border-t border-white/5 pt-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-headline font-bold text-white uppercase tracking-wider">Garrafa Retornável?</h4>
                        <p className="text-[10px] font-mono text-white/35 uppercase">Exige devolução de casco vazio no PDV</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditIsReturnable(!editIsReturnable)}
                        className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase font-bold border transition-colors ${
                          editIsReturnable 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                            : "bg-white/5 border-white/5 text-white/40"
                        }`}
                      >
                        {editIsReturnable ? "Sim" : "Não"}
                      </button>
                    </div>

                    {editIsReturnable && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Valor de Depósito do Casco (R$)</label>
                        <input 
                          type="text"
                          value={editDepositFee}
                          onChange={(e) => setEditDepositFee(e.target.value)}
                          placeholder="Ex: 2,00"
                          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white text-sm font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* CALCULADORA DE PRECIFICAÇÃO (MARKUP & ICMS-ST) - Idea 3 */}
                  <div className="border-t border-white/5 pt-5 space-y-3">
                    <details className="group">
                      <summary className="list-none flex items-center justify-between cursor-pointer focus:outline-none">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-headline font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            Precificação Inteligente (ST/Markup)
                          </h4>
                          <p className="text-[10px] font-mono text-white/35 uppercase">Calcule margem real embutindo impostos e custos</p>
                        </div>
                        <span className="text-xs font-mono text-white/30 group-open:rotate-180 transition-transform">▼</span>
                      </summary>

                      <div className="space-y-4 pt-4 mt-2 border-t border-white/5 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono uppercase text-white/40 block">Custo Nota (R$)</label>
                            <input 
                              type="text" 
                              value={calcCustoBruto} 
                              onChange={(e) => setCalcCustoBruto(e.target.value)} 
                              placeholder="0,00"
                              className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded font-mono text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono uppercase text-white/40 block">Frete Rateado (R$)</label>
                            <input 
                              type="text" 
                              value={calcFrete} 
                              onChange={(e) => setCalcFrete(e.target.value)} 
                              placeholder="0,00"
                              className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded font-mono text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono uppercase text-white/40 block">ICMS-ST / IPI (%)</label>
                            <input 
                              type="text" 
                              value={calcImpostos} 
                              onChange={(e) => setCalcImpostos(e.target.value)} 
                              placeholder="Ex: 10"
                              className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded font-mono text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono uppercase text-white/40 block">Margem Líquida (%)</label>
                            <input 
                              type="text" 
                              value={calcMargem} 
                              onChange={(e) => setCalcMargem(e.target.value)} 
                              placeholder="Ex: 35"
                              className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded font-mono text-white"
                            />
                          </div>
                        </div>

                        {/* Calculated Results Panel */}
                        {(() => {
                          const base = parseFloat(calcCustoBruto.replace(",", ".")) || 0;
                          const frete = parseFloat(calcFrete.replace(",", ".")) || 0;
                          const impPercent = parseFloat(calcImpostos.replace(",", ".")) || 0;
                          const margem = parseFloat(calcMargem.replace(",", ".")) || 35;

                          const custoTotal = base + frete;
                          const custoEfetivo = custoTotal * (1 + impPercent / 100);
                          const margemRatio = 1 - (margem / 100);
                          const precoSugerido = margemRatio > 0 ? custoEfetivo / margemRatio : custoEfetivo;

                          return (
                            <div className="bg-black/80 border border-white/5 p-3 rounded-lg space-y-2 text-[10px] font-mono uppercase">
                              <div className="flex justify-between text-white/40">
                                <span>Custo Efetivo c/ ST:</span>
                                <span className="font-bold text-white">{formatCurrency(custoEfetivo)}</span>
                              </div>
                              <div className="flex justify-between text-emerald-400">
                                <span>Preço Venda Sugerido:</span>
                                <span className="font-bold">{formatCurrency(precoSugerido)}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditCost(custoEfetivo.toFixed(2).replace(".", ","));
                                  setEditSell(precoSugerido.toFixed(2).replace(".", ","));
                                }}
                                className="w-full mt-2 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold hover:bg-emerald-500/20 rounded transition-colors text-center text-[9px]"
                              >
                                Aplicar Valores Calculados
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </details>
                  </div>

                  {/* CUSTOM RECIPE / COMBO COMPOSER SECTION */}
                  <div className="border-t border-white/5 pt-5 space-y-4">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-headline font-bold text-white uppercase tracking-wider">Composição de Combo / Receita</h4>
                      <p className="text-[10px] font-mono text-white/35 uppercase">Deduza doses ou gelo automaticamente ao vender copões</p>
                    </div>

                    {/* Linked ingredients list */}
                    {editRecipe.length > 0 ? (
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {editRecipe.map((ing) => {
                          const matchingItem = stock.find(s => s.id === ing.product_id);
                          return (
                            <div key={ing.product_id} className="flex justify-between items-center bg-black/40 border border-white/5 p-2 rounded-lg text-[11px]">
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-semibold text-white/90 truncate block">{matchingItem?.name || "Produto Excluído"}</span>
                                <span className="font-mono text-white/40 block">Dedução: {ing.quantity} (ex: {ing.quantity === 0.25 ? "1/4 garrafa" : `${ing.quantity} unid`})</span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleRemoveIngredient(ing.product_id)}
                                className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-black/20 border border-dashed border-white/5 rounded-lg text-[10px] font-mono uppercase text-white/30">
                        Nenhum ingrediente vinculado a este combo.
                      </div>
                    )}

                    {/* Add ingredient controls */}
                    <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-3">
                      <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">Vincular Novo Ingrediente</span>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={selectedIngredientId}
                          onChange={(e) => setSelectedIngredientId(e.target.value)}
                          className="bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="">Selecione...</option>
                          {stock.filter(s => s.id !== editingProduct.id).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>

                        <input 
                          type="text"
                          value={ingredientQty}
                          onChange={(e) => setIngredientQty(e.target.value)}
                          placeholder="Dose (ex: 0.25)"
                          className="bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white text-center font-mono focus:outline-none placeholder-white/20"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!selectedIngredientId}
                        onClick={handleAddIngredient}
                        className="w-full py-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 text-[10px] uppercase font-bold font-mono tracking-wider rounded-lg transition-colors"
                      >
                        Vincular Ingrediente
                      </button>
                    </div>
                  </div>

                  {/* LOTES E VALIDADES - Idea 2 */}
                  <div className="border-t border-white/5 pt-5 space-y-4">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-headline font-bold text-white uppercase tracking-wider">Lotes & Validades</h4>
                      <p className="text-[10px] font-mono text-white/35 uppercase">Gerencie datas de vencimento deste produto</p>
                    </div>

                    {/* Active batches list */}
                    {editBatches.length > 0 ? (
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {editBatches.map((batch, idx) => {
                          const now = new Date();
                          const expDate = new Date(batch.expiration_date + "T12:00:00");
                          const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          const isExpired = expDate <= now;
                          const isSoon = diffDays > 0 && diffDays <= 30;

                          return (
                            <div key={idx} className="flex justify-between items-center bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] font-mono">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white">Lote: {batch.lot_number || "S/N"}</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[7px] border font-bold uppercase ${
                                    isExpired 
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/25 animate-pulse" 
                                      : isSoon 
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  }`}>
                                    {isExpired ? "Vencido ⚠️" : isSoon ? "Vence Breve" : "Ok"}
                                  </span>
                                </div>
                                <span className="text-white/40 block">Vencimento: {new Date(batch.expiration_date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                                <span className="text-white/40 block">Qtd Lote: {batch.quantity} un</span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  setEditBatches(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Excluir lote"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-black/20 border border-dashed border-white/5 rounded-lg text-[10px] font-mono uppercase text-white/30">
                        Nenhum lote registrado para controle de validade.
                      </div>
                    )}

                    {/* Add new batch form inputs */}
                    <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-3">
                      <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">Registrar Novo Lote</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input 
                          type="text"
                          value={newLotNumber}
                          onChange={(e) => setNewLotNumber(e.target.value)}
                          placeholder="Nº Lote"
                          className="bg-black border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none placeholder-white/20"
                        />
                        <input 
                          type="date"
                          value={newLotExpirationDate}
                          onChange={(e) => setNewLotExpirationDate(e.target.value)}
                          className="bg-black border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs items-center">
                        <span className="text-[10px] font-mono text-white/40 uppercase">Qtd do Lote:</span>
                        <input 
                          type="number"
                          value={newLotQuantity}
                          onChange={(e) => setNewLotQuantity(parseInt(e.target.value) || 1)}
                          min="1"
                          className="bg-black border border-white/10 rounded px-2.5 py-1 text-center font-mono focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!newLotExpirationDate}
                        onClick={() => {
                          const parsedQty = newLotQuantity || 1;
                          setEditBatches(prev => [...prev, {
                            lot_number: newLotNumber.trim(),
                            expiration_date: newLotExpirationDate,
                            quantity: parsedQty
                          }]);
                          setNewLotNumber("");
                          setNewLotExpirationDate("");
                          setNewLotQuantity(1);
                        }}
                        className="w-full py-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 text-[10px] uppercase font-bold font-mono tracking-wider rounded-lg transition-colors"
                      >
                        Adicionar Lote
                      </button>
                    </div>
                  </div>

                  {/* HISTÓRICO DE REAJUSTES (INFLAÇÃO) - Idea 5 */}
                  {editingProduct.price_history && editingProduct.price_history.length > 0 && (
                    <div className="border-t border-white/5 pt-5 space-y-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-headline font-bold text-white uppercase tracking-wider">Histórico de Reajustes</h4>
                        <p className="text-[10px] font-mono text-white/35 uppercase">Acompanhe a inflação e margens de venda</p>
                      </div>

                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {editingProduct.price_history.map((hist: any, index: number) => {
                          const prevHist = index > 0 ? editingProduct.price_history[index - 1] : null;
                          const costDiff = prevHist ? hist.cost - prevHist.cost : 0;
                          const sellDiff = prevHist ? hist.sell - prevHist.sell : 0;

                          return (
                            <div key={index} className="flex justify-between items-center bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-mono hover:border-white/10 transition-colors">
                              <span className="text-white/50">{new Date(hist.date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                              <div className="text-right space-y-0.5">
                                <div>
                                  <span className="text-white/30 uppercase">Custo: </span>
                                  <span className="text-white font-bold">{formatCurrency(hist.cost)}</span>
                                  {costDiff !== 0 && (
                                    <span className={`ml-1.5 font-bold ${costDiff > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                                      {costDiff > 0 ? "▲" : "▼"} {formatCurrency(Math.abs(costDiff))}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span className="text-white/30 uppercase">Venda: </span>
                                  <span className="text-emerald-400 font-bold">{formatCurrency(hist.sell)}</span>
                                  {sellDiff !== 0 && (
                                    <span className={`ml-1.5 font-bold ${sellDiff > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                      {sellDiff > 0 ? "▲" : "▼"} {formatCurrency(Math.abs(sellDiff))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full mt-4 py-2.5 bg-white text-black font-headline font-bold text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
                  >
                    Salvar Alterações
                  </button>
                </form>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-start gap-2.5 mt-6">
                <AlertCircle className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-white/50 leading-relaxed uppercase">
                  O estoque se ajustará fracionariamente com base na receita ao fechar vendas de combos na frente de caixa.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* XML DANFE Preview Modal - Idea 4 */}
      <AnimatePresence>
        {isXmlModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl bg-[#09090b] border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_60px_rgba(16,185,129,0.1)] relative overflow-hidden max-h-[85vh] flex flex-col justify-between"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-emerald-500/10 blur-xl rounded-full" />

              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <ShoppingBag className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-headline font-black text-sm tracking-wider text-white uppercase">
                        REVISÃO DE IMPORTAÇÃO XML
                      </h3>
                      <p className="text-[10px] font-mono text-white/40 uppercase mt-0.5">
                        Arquivo: {xmlFileName}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsXmlModalOpen(false);
                      const inputElement = document.getElementById("xml-upload-input") as HTMLInputElement;
                      if (inputElement) inputElement.value = "";
                    }}
                    className="p-1 rounded text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Warning message */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-mono uppercase text-amber-400 flex items-start gap-2.5 leading-relaxed mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Atenção: Os produtos correspondentes com código de barras ou nome idêntico no estoque serão atualizados (custo atualizado e quantidade adicionada). Novos produtos não localizados serão inseridos no estoque como &quot;Planejado&quot;.
                  </span>
                </div>

                {/* Items List Table */}
                <div className="overflow-y-auto max-h-[40vh] border border-white/5 rounded-lg bg-black/40 pr-1">
                  <table className="w-full text-[10px] font-mono uppercase text-white/60">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] text-white/40 text-left bg-white/[0.02]">
                        <th className="py-2.5 px-3">Produto XML / EAN</th>
                        <th className="py-2.5 px-3 text-center">Qtd</th>
                        <th className="py-2.5 px-3 text-right">Custo Un</th>
                        <th className="py-2.5 px-3 text-center">Ação / Vínculo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {xmlItems.map((item, idx) => {
                        const isMatched = !!item.matches_product_id;
                        const matchingItem = stock.find(s => s.id === item.matches_product_id);
                        
                        return (
                          <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-3 max-w-[240px]">
                              <span className="font-bold text-white block truncate">{item.name}</span>
                              <span className="text-[9px] text-white/30 block mt-0.5">
                                EAN: {item.barcode || "NÃO CADASTRADO"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-white font-bold">{item.quantity}</td>
                            <td className="py-3 px-3 text-right text-white font-bold">{formatCurrency(item.cost)}</td>
                            <td className="py-3 px-3 text-center">
                              {isMatched ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Vincular: {matchingItem?.name}
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Novo Item Estoque
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Summary Section */}
              <div className="mt-5 space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-white/40 block">Total do Custo da Nota</span>
                    <span className="text-xl font-headline font-black text-emerald-400 mt-0.5 block">
                      {formatCurrency(xmlTotalValue)}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-white/40 block">Total de Itens</span>
                    <span className="text-xl font-headline font-black text-white mt-0.5 block">
                      {xmlItems.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsXmlModalOpen(false);
                      const inputElement = document.getElementById("xml-upload-input") as HTMLInputElement;
                      if (inputElement) inputElement.value = "";
                    }}
                    className="flex-1 py-3 border border-white/10 hover:border-white/20 text-white font-headline font-bold text-[10px] tracking-wider rounded uppercase transition-colors"
                  >
                    Descartar Nota
                  </button>

                  <button
                    onClick={handleConfirmXmlImport}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-headline font-bold text-[10px] tracking-wider rounded uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.35)]"
                  >
                    Confirmar Entrada
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
    </div>
  );
}
