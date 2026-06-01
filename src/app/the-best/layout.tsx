"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AdegaProvider, useAdega } from "@/context/AdegaContext";
import { 
  TrendingUp, 
  DollarSign, 
  Wine, 
  Lightbulb, 
  Settings, 
  Menu, 
  X, 
  Cloud, 
  CloudOff,
  Copy,
  HelpCircle,
  CalendarDays,
  ShoppingBag,
  Receipt,
  User,
  Lock,
  ShieldAlert
} from "lucide-react";
import Image from "next/image";

function ConnectionBadge() {
  const { isCloudMode, isLoadingData, dbError, reconnect } = useAdega();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-xs text-white/60">
      <span className="relative flex h-2 w-2">
        {isCloudMode ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        )}
      </span>
      <span className="font-mono text-[10px] tracking-wider uppercase">
        {isLoadingData ? "Sincronizando..." : isCloudMode ? "Supabase Nuvem" : "Modo Local"}
      </span>
    </div>
  );
}

function SidebarContent({ onClose, onOpenAudit }: { onClose?: () => void; onOpenAudit?: () => void }) {
  const pathname = usePathname();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { dbConfig, saveConnection, disconnect, isTestingConfig, dbError, currentUser, logout } = useAdega();
  const [inputUrl, setInputUrl] = useState(dbConfig?.url || "");
  const [inputKey, setInputKey] = useState(dbConfig?.anonKey || "");
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  const menuItems = [
    { href: "/the-best", label: "Visão Geral", icon: TrendingUp },
    { href: "/the-best/vendas", label: "Relatório de Vendas", icon: Receipt },
    { href: "/the-best/custos", label: "Custos & Rateio", icon: DollarSign },
    { href: "/the-best/fixas", label: "Contas Fixas", icon: CalendarDays },
    { href: "/the-best/estoque", label: "Estoque & Compras", icon: Wine },
    { href: "/the-best/ideias", label: "Mural de Ideias", icon: Lightbulb },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveConnection(inputUrl, inputKey);
    if (success) {
      setShowSettingsModal(false);
    }
  };

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
  status text not null,
  price_cost numeric default 0,
  price_sell numeric default 0,
  barcode text
);

-- 4. Tabela de Contas Fixas
create table thebest_fixed (
  id text primary key,
  description text not null,
  amount numeric not null,
  "dueDay" integer not null,
  "paidThisMonth" boolean default false,
  assignee text not null
);

-- 5. Tabela de Vendas
create table thebest_sales (
  id text primary key,
  items jsonb not null,
  total_amount numeric not null,
  payment_method text not null,
  profit numeric not null,
  date timestamp default current_timestamp
);

-- 6. Tabela de Auditoria
create table thebest_audit (
  id text primary key,
  "user" text not null,
  action text not null,
  date timestamp default current_timestamp
);`;

  return (
    <div className="flex flex-col h-full justify-between p-6 bg-[#080809] border-r border-white/5 relative z-10">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group w-12 h-12 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border border-dashed border-white/10 group-hover:border-white/30 animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-0.5 rounded-full overflow-hidden bg-black flex items-center justify-center">
                <Image 
                  src="/adega/crest_white.png" 
                  alt="The Best Crest" 
                  width={40} 
                  height={40} 
                  className="object-contain transform group-hover:scale-110 transition-transform duration-500 invert"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="font-headline text-lg tracking-widest text-white font-bold leading-tight">THE BEST</h1>
              <span className="text-[10px] tracking-[0.25em] text-white/40 font-mono uppercase">ADEGA & BAR</span>
            </div>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-white/60 hover:text-white transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-2.5">
          {/* Main Action: Frente de Caixa (PDV) - Prominent highlighted primary button */}
          <Link
            href="/the-best/pdv"
            onClick={onClose}
            className={`relative flex items-center justify-between px-4 py-3.5 rounded-lg text-sm transition-all duration-300 border group overflow-hidden ${
              pathname === "/the-best/pdv"
                ? "bg-white text-black border-white font-bold shadow-lg shadow-white/5"
                : "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold"
            }`}
          >
            <div className="flex items-center gap-3 relative z-10">
              <ShoppingBag className={`w-4 h-4 transition-colors duration-300 ${
                pathname === "/the-best/pdv" ? "text-black" : "text-emerald-400 group-hover:text-emerald-300"
              }`} />
              <span className="font-headline tracking-widest uppercase text-xs">Frente de Caixa (PDV)</span>
            </div>
            
            {pathname !== "/the-best/pdv" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </Link>

          <div className="h-[1px] bg-white/5 my-1" />

          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={onClose}
                className="relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 group"
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-white/[0.03] border border-white/5 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`w-4 h-4 transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white/40 group-hover:text-white/80"
                }`} />
                <span className={`font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? "text-white font-semibold" : "text-white/60 group-hover:text-white"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col gap-4 mt-auto">
        {/* User Session Info */}
        {currentUser && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70">
            <span className="font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-white/40" />
              {currentUser}
            </span>
            <button 
              onClick={() => {
                logout();
                if (onClose) onClose();
              }}
              className="text-[9px] font-mono uppercase tracking-wider text-rose-400 hover:text-rose-300 font-bold transition-colors"
            >
              Sair
            </button>
          </div>
        )}

        <ConnectionBadge />
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/80 transition-colors duration-300 font-mono"
          >
            <Settings className="w-3.5 h-3.5" />
            Configurar BD
          </button>
          
          {/* Secret/Hidden Audit Log Button */}
          <button 
            onClick={onOpenAudit}
            className="text-[10px] font-mono text-white/20 hover:text-white/40 tracking-wider transition-colors cursor-pointer select-none"
            title="Registro Secreto"
          >
            v2026.06
          </button>
        </div>
      </div>

      {/* Database Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e0e10] border border-white/10 rounded-xl p-6 text-white overflow-y-auto max-h-[90vh] shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-white/80" />
                <div>
                  <h3 className="font-headline text-lg tracking-wider font-bold">CONFIGURAÇÕES DE CONEXÃO</h3>
                  <p className="text-xs text-white/40">Banco de Dados Supabase (Totalmente online e compartilhado)</p>
                </div>
              </div>

              {dbError && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 text-red-200 text-xs rounded-lg flex items-start gap-2 leading-relaxed">
                  <span>⚠️</span>
                  <p>{dbError}</p>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Supabase URL</label>
                  <input 
                    type="text" 
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://suaconta.supabase.co"
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white/90 placeholder-white/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-white/50 tracking-wider">Chave Anon (Public)</label>
                  <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded focus:border-white/30 focus:outline-none text-white/90 placeholder-white/20 font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit"
                    disabled={isTestingConfig}
                    className="flex-1 px-4 py-2.5 bg-white text-black font-semibold rounded text-xs hover:bg-white/90 transition-all uppercase tracking-wider disabled:opacity-50"
                  >
                    {isTestingConfig ? "Conectando..." : "Salvar & Sincronizar"}
                  </button>

                  {dbConfig && (
                    <button 
                      type="button"
                      onClick={() => {
                        disconnect();
                        setInputUrl("");
                        setInputKey("");
                        setShowSettingsModal(false);
                      }}
                      className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 rounded text-xs transition-all uppercase tracking-wider font-semibold"
                    >
                      Desconectar
                    </button>
                  )}
                </div>
              </form>

              {/* DB SQL Help */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowSqlHelp(!showSqlHelp)}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors uppercase font-mono tracking-wider"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Como criar as tabelas no seu Supabase?
                </button>

                {showSqlHelp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-black/60 rounded-lg border border-white/5 space-y-3"
                  >
                    <p className="text-xs text-white/60 leading-relaxed">
                      Se você estiver configurando um novo Supabase, abra o <strong>SQL Editor</strong> no painel deles, cole o script abaixo e clique em <strong>Run</strong>:
                    </p>
                    <div className="relative">
                      <pre className="text-[10px] font-mono text-emerald-400/90 overflow-x-auto p-3 bg-black/80 rounded border border-white/5 leading-relaxed max-h-48">
                        {sqlCreateScripts}
                      </pre>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(sqlCreateScripts);
                          alert("SQL Copiado!");
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors text-white/80"
                        title="Copiar SQL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PageLoadingSkeleton() {
  return (
    <main className="w-full min-h-screen bg-[#070405] text-[#F2F0E9] flex flex-col justify-center items-center font-body p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_20s_linear_infinite]" />
          <Image 
            src="/adega/crest_white.png" 
            alt="The Best Crest" 
            width={72} 
            height={72} 
            className="object-contain invert opacity-60 animate-pulse"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-headline tracking-widest text-white/80 uppercase font-semibold">THE BEST</h2>
          <span className="text-[10px] tracking-[0.2em] text-white/40 font-mono">CARREGANDO A ADEGA...</span>
        </div>
        <div className="w-36 h-0.5 bg-white/5 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-white/40 rounded-full animate-[sweep_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </main>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { mounted, currentUser, login, logout, auditLog, clearAuditLog } = useAdega();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  // Login Form States
  const [selectedUser, setSelectedUser] = useState<"Oliveira" | "Marques">("Oliveira");
  const [pinInput, setPinInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  if (!mounted) {
    return <PageLoadingSkeleton />;
  }

  // Gatekeeper: If no active user session, block dashboard and display login portal
  if (!currentUser) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const success = login(selectedUser, pinInput);
      if (!success) {
        setLoginError(true);
        setPinInput("");
        setTimeout(() => setLoginError(false), 2000);
      }
    };

    return (
      <main className="w-full min-h-screen bg-[#050505] text-[#F2F0E9] flex flex-col justify-center items-center p-6 selection:bg-white selection:text-black">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-radial-gradient from-white/[0.01] to-transparent pointer-events-none rounded-full blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm bg-[#0b0b0d] border border-white/10 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative"
        >
          {/* Logo Crest */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_30s_linear_infinite]" />
              <Image 
                src="/adega/crest_white.png" 
                alt="The Best Crest" 
                width={48} 
                height={48} 
                className="object-contain invert opacity-80"
              />
            </div>
            <div>
              <h2 className="text-xl font-headline font-black tracking-widest text-white uppercase">THE BEST</h2>
              <span className="text-[10px] tracking-[0.2em] text-white/30 font-mono uppercase block mt-0.5">Portal de Acesso</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* User Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-white/50 tracking-wider block">Selecione o Operador</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedUser("Oliveira")}
                  className={`py-2.5 rounded-xl text-xs font-mono uppercase border transition-all duration-300 font-semibold ${
                    selectedUser === "Oliveira" 
                      ? "bg-white text-black border-white shadow-lg" 
                      : "bg-black/40 border-white/5 text-white/40 hover:text-white/60"
                  }`}
                >
                  Oliveira
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedUser("Marques")}
                  className={`py-2.5 rounded-xl text-xs font-mono uppercase border transition-all duration-300 font-semibold ${
                    selectedUser === "Marques" 
                      ? "bg-white text-black border-white shadow-lg" 
                      : "bg-black/40 border-white/5 text-white/40 hover:text-white/60"
                  }`}
                >
                  Marques
                </button>
              </div>
            </div>

            {/* PIN Passcode Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-white/50 tracking-wider block">Código PIN / Senha</label>
              <input 
                type="password" 
                required
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className={`w-full px-4 py-3 bg-black/60 border rounded-xl text-center text-lg font-mono tracking-[0.5em] focus:outline-none transition-all ${
                  loginError 
                    ? "border-rose-500 text-rose-400 bg-rose-950/10" 
                    : "border-white/10 focus:border-white/30 text-white placeholder-white/20"
                }`}
              />
            </div>

            {/* Submit */}
            <button 
              type="submit"
              className="w-full py-3 bg-white text-black font-headline font-bold text-xs tracking-widest rounded-xl uppercase hover:bg-white/90 transition-all shadow-lg"
            >
              Autenticar
            </button>
          </form>

          {/* Footer info */}
          <div className="text-center text-[9px] font-mono text-white/20 uppercase tracking-widest mt-2 border-t border-white/5 pt-4">
            Adega & Conveniência The Best
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F0E9] font-body flex flex-col lg:flex-row relative overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden w-full px-6 py-4 bg-[#080809]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Image 
            src="/adega/crest_white.png" 
            alt="The Best Crest" 
            width={32} 
            height={32} 
            className="object-contain invert"
          />
          <div>
            <h1 className="font-headline text-md tracking-wider text-white font-bold uppercase leading-none">THE BEST</h1>
            <span className="text-[8px] tracking-widest text-white/30 uppercase font-mono">ADEGA & BAR</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-white/80 hover:text-white transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer (Framer Motion Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer Panel */}
            <motion.div 
              initial={{ translateX: "-100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85vw] h-full"
            >
              <SidebarContent 
                onClose={() => setMobileMenuOpen(false)} 
                onOpenAudit={() => {
                  setMobileMenuOpen(false);
                  setShowAuditDrawer(true);
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Fixed Left Side) */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent onOpenAudit={() => setShowAuditDrawer(true)} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:max-h-screen lg:overflow-y-auto min-h-[calc(100vh-69px)] lg:min-h-screen relative p-6 lg:p-10 flex flex-col justify-start">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial-gradient from-white/[0.015] to-transparent pointer-events-none -z-10 rounded-full blur-3xl" />
        
        {/* Animated Page Wrap */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-7xl mx-auto flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* Secret Audit Trail Drawer */}
      <AnimatePresence>
        {showAuditDrawer && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end bg-black/60 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuditDrawer(false)}
              className="absolute inset-0"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ translateX: "100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-[#0e0e10] border-l border-white/10 p-6 flex flex-col z-10 shadow-2xl justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <h3 className="font-headline font-bold text-base tracking-wider text-white uppercase">Logs de Auditoria</h3>
                  </div>
                  <button 
                    onClick={() => setShowAuditDrawer(false)}
                    className="p-1 rounded text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Audit Logs list */}
                {auditLog.length > 0 ? (
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {auditLog.map((log) => (
                      <div 
                        key={log.id}
                        className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-[9px] font-mono text-white/35 uppercase">
                          <span className="text-white font-bold">👤 {log.user}</span>
                          <span>{new Date(log.date).toLocaleDateString("pt-BR")} {new Date(log.date).toLocaleTimeString("pt-BR")}</span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed font-sans">{log.action}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-xs text-white/30 font-mono uppercase bg-white/[0.005] border border-dashed border-white/5 rounded-lg">
                    Nenhum registro de atividade encontrado.
                  </div>
                )}
              </div>

              {/* Clear Log option */}
              {auditLog.length > 0 && (
                <div className="pt-4 border-t border-white/5 mt-auto">
                  <button
                    onClick={() => {
                      if (window.confirm("Deseja limpar permanentemente todos os registros de auditoria?")) {
                        clearAuditLog();
                      }
                    }}
                    className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-450 border border-red-500/10 rounded-xl text-xs font-mono uppercase font-bold transition-all"
                  >
                    Limpar Logs de Auditoria
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function AdegaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdegaProvider>
      <LayoutInner>{children}</LayoutInner>
    </AdegaProvider>
  );
}
