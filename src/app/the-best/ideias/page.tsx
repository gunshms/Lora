"use client";

import React, { useState } from "react";
import { useAdega, IdeaItem } from "@/context/AdegaContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Plus,
  Trash2,
  PlusCircle,
  Tag,
  AlertCircle,
  X
} from "lucide-react";

export default function IdeiasPage() {
  const {
    ideas,
    addIdea,
    deleteIdea
  } = useAdega();

  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Form states
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDesc, setIdeaDesc] = useState("");
  const [ideaCat, setIdeaCat] = useState("Decoração");
  const [ideaColor, setIdeaColor] = useState<IdeaItem["color"]>("gold");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaDesc.trim()) return;

    const success = await addIdea(ideaTitle, ideaDesc, ideaCat, ideaColor);
    if (success) {
      setIdeaTitle("");
      setIdeaDesc("");
      setIdeaCat("Decoração");
      setIdeaColor("gold");
      setIsAddingIdea(false);
    }
  };

  const categories = [
    "Decoração",
    "Iluminação",
    "Cardápio / Bebidas",
    "Mobiliário",
    "Eventos",
    "Projetos",
    "Outros"
  ];

  const colorOptions: { id: IdeaItem["color"]; label: string; styles: string; bg: string }[] = [
    { id: "gold", label: "Dourado", styles: "bg-[#EAC154] border-[#EAC154]", bg: "bg-amber-500/10 border-amber-500/20 text-amber-200" },
    { id: "burgundy", label: "Vinho", styles: "bg-[#4A0404] border-[#4A0404]", bg: "bg-rose-500/10 border-rose-500/20 text-rose-200" },
    { id: "sage", label: "Sálvia", styles: "bg-[#7D9F81] border-[#7D9F81]", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" },
    { id: "terracotta", label: "Argila", styles: "bg-[#C05C46] border-[#C05C46]", bg: "bg-orange-500/10 border-orange-500/20 text-orange-200" },
    { id: "charcoal", label: "Carvão", styles: "bg-[#2E2E32] border-[#2E2E32]", bg: "bg-white/5 border-white/10 text-white/80" },
  ];

  return (
    <div className="space-y-8 py-4">

      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <span className="text-xs font-mono uppercase text-white/40 tracking-[0.2em]">Mural Criativo</span>
          <h2 className="font-headline text-3xl font-black tracking-widest text-white mt-1 uppercase">
            MURAL DE IDEIAS
          </h2>
        </div>

        <button
          onClick={() => setIsAddingIdea(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold font-headline text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Nova Ideia
        </button>
      </div>

      {/* Idea Sticky Notes Grid */}
      {ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => {
            const colorCfg = colorOptions.find(c => c.id === idea.color) || colorOptions[0];
            return (
              <div
                key={idea.id}
                className={`border rounded-xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[180px] hover:scale-[1.01] transition-all duration-300 ${colorCfg.bg}`}
              >
                {/* Top bar: title & category */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-headline font-bold text-base tracking-wide text-white leading-tight uppercase">
                      {idea.title}
                    </h3>

                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/5 text-white/60">
                      <Tag className="w-2.5 h-2.5" />
                      {idea.category}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-white/70 whitespace-pre-line">
                    {idea.description}
                  </p>
                </div>

                {/* Bottom bar: date & delete */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                    {idea.date}
                  </span>

                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                    title="Excluir ideia"
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
          <Lightbulb className="w-10 h-10 text-white/20" />
          <p className="text-xs font-mono uppercase text-white/30 tracking-wider">
            Nenhuma ideia ou anotação cadastrada no mural.
          </p>
        </div>
      )}

      {/* Add Idea Sidebar Drawer */}
      <AnimatePresence>
        {isAddingIdea && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end bg-black/60 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingIdea(false)}
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
                    <h3 className="font-headline font-bold text-lg tracking-wider text-white uppercase">CRIAR NOVA IDEIA</h3>
                  </div>
                  <button
                    onClick={() => setIsAddingIdea(false)}
                    className="p-1 rounded text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Título da Ideia</label>
                    <input
                      type="text"
                      required
                      value={ideaTitle}
                      onChange={(e) => setIdeaTitle(e.target.value)}
                      placeholder="Ex: Espaço para charutos no balcão"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block">Categoria</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setIdeaCat(cat)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
                            ideaCat === cat
                              ? "bg-white text-black font-semibold"
                              : "bg-white/[0.02] border border-white/5 text-white/50 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Descrição / Detalhes</label>
                    <textarea
                      required
                      rows={4}
                      value={ideaDesc}
                      onChange={(e) => setIdeaDesc(e.target.value)}
                      placeholder="Descreva a ideia em detalhes..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white placeholder-white/20 text-sm resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-white/50 tracking-wider block font-bold">Estilo de Cor (Mural Sumi-ê)</label>
                    <div className="flex items-center gap-3">
                      {colorOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIdeaColor(opt.id)}
                          className={`w-6 h-6 rounded-full border transition-all duration-300 flex items-center justify-center ${opt.styles} ${
                            ideaColor === opt.id ? "scale-125 border-white shadow-lg" : "scale-100 opacity-60 hover:opacity-100"
                          }`}
                          title={opt.label}
                        >
                          {ideaColor === opt.id && <span className="w-1.5 h-1.5 bg-black rounded-full" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-2.5 bg-white text-black font-headline font-bold text-xs tracking-wider rounded uppercase hover:bg-white/90 transition-all duration-300"
                  >
                    Salvar no Mural
                  </button>
                </form>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-white/50 leading-relaxed uppercase">
                  O mural é interativo e ideal para planejar a adega e o bar. Use as cores sumi-ê para criar contraste visual no quadro.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
