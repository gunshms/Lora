"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import RGBButton from "./RGBButton";
import ServiceCard from "./ServiceCard";
import BudgetModal from "./BudgetModal";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Services() {
    const { dict } = useLanguage();
    const services = dict.services.list;
    // Start null so it's centered by default
    const [activeService, setActiveService] = useState<typeof services[0] | null>(null);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMouseEnter = (service: typeof services[0]) => {
        if (activeService?.slug === service.slug) return;

        if (timeoutId) clearTimeout(timeoutId);

        const id = setTimeout(() => {
            setActiveService(service);
        }, 100); // 100ms debounce
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setActiveService(null);
    };

    return (
        <section className="relative w-full py-32 z-20 border-t border-white/5 min-h-screen flex items-center justify-center overflow-hidden">
            <div
                className="max-w-7xl w-full mx-auto px-4 md:px-12 flex items-center justify-center relative min-h-[600px]"
                onMouseLeave={handleMouseLeave}
            >

                {/* 
                   CONTENT LAYER
                   We use a precise AnimateLayout approach:
                   - If !activeService: One column centered.
                   - If activeService: Two columns (50% / 50%).
                */}

                <div className="flex w-full h-full items-center justify-center">

                    {/* LEFT COLUMN: THE CARD */}
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: activeService ? "50%" : "0%",
                            opacity: activeService ? 1 : 0
                        }}
                        transition={{ type: "spring", stiffness: 45, damping: 20, mass: 1 }}
                        className="flex items-center justify-center overflow-hidden h-full relative"
                    >
                        <div className="w-[340px] perspective-[2000px] relative z-20">
                            <AnimatePresence mode="wait">
                                {activeService && (
                                    <ServiceCard
                                        key={activeService.slug}
                                        title={activeService.title}
                                        description={activeService.details || activeService.description}
                                        cover={activeService.cover || ""}
                                        progress={((services.indexOf(activeService as any) + 1) / services.length) * 100}
                                        indexLabel={`0${services.indexOf(activeService as any) + 1}`}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: THE LIST */}
                    <motion.div
                        className="flex flex-col justify-center relative z-10 h-full"
                        initial={false}
                        animate={{
                            width: activeService ? "50%" : "100%",
                        }}
                        transition={{ type: "spring", stiffness: 45, damping: 20, mass: 1 }}
                    >
                        {/* 
                           Inner Container:
                           Always centered in the column.
                           As column moves Right (100% -> 50% width), this content slides Right smoothly.
                        */}
                        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">

                            {/* Header */}
                            <div className="mb-12 relative">
                                <h2 className="text-sm font-body tracking-[0.5em] uppercase text-accent-gold mb-2">{dict.services.title}</h2>
                                <h3 className="text-4xl md:text-6xl font-headline uppercase text-white leading-none">
                                    Select Your <br /> Path
                                </h3>
                            </div>

                            <ul className="flex flex-col gap-6 w-full items-center">
                                {services.map((service, i) => {
                                    const isActive = activeService?.slug === service.slug;

                                    return (
                                        <li
                                            key={i}
                                            className="group cursor-pointer relative w-max"
                                            onMouseEnter={() => handleMouseEnter(service as any)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`text-xs font-mono transition-colors duration-500 ${isActive ? 'text-accent-gold' : 'text-white/20'}`}>
                                                    0{i + 1}
                                                </span>
                                                <div className="relative">
                                                    <h3 className={`text-2xl md:text-4xl font-headline uppercase transition-all duration-500 ${isActive ? "text-accent-gold scale-110" : "text-white/50 group-hover:text-white"}`}>
                                                        {service.title}
                                                    </h3>
                                                    {/* Glow effect under active item */}
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="glow"
                                                            className="absolute -inset-4 bg-accent-gold/5 blur-xl rounded-full -z-10"
                                                            transition={{ duration: 0.5 }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <motion.div
                                className="mt-16"
                                animate={{ opacity: activeService ? 0 : 1, y: activeService ? 20 : 0 }} // Fade out CTA
                            >
                                <RGBButton
                                    text={dict.services.cta}
                                    onClick={() => setIsModalOpen(true)}
                                />
                            </motion.div>

                        </div>
                    </motion.div>

                </div>
            </div>

            <BudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    )
}
