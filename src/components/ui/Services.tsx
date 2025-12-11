"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import RGBButton from "./RGBButton";
import ServiceCard from "./ServiceCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Services() {
    const { dict } = useLanguage();
    const services = dict.services.list;
    // Start null so it's centered by default
    const [activeService, setActiveService] = useState<typeof services[0] | null>(null);

    return (
        <section className="relative w-full py-32 z-20 border-t border-white/5 min-h-screen flex items-center justify-center overflow-hidden">
            <div
                className="max-w-7xl w-full mx-auto px-4 md:px-12 flex items-center justify-center relative min-h-[600px]"
                onMouseLeave={() => setActiveService(null)} // Optional: Reset when leaving the entire section
            >

                {/* 
                   CONTENT LAYER
                   We use a precise AnimateLayout approach:
                   - If !activeService: One column centered.
                   - If activeService: Two columns (50% / 50%).
                */}

                <div className="flex w-full h-full items-center transition-all duration-700 ease-in-out">

                    {/* LEFT COLUMN: THE CARD (Hidden initially) */}
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: activeService ? "50%" : "0%",
                            opacity: activeService ? 1 : 0
                        }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        className="flex items-center justify-center overflow-hidden"
                    >
                        <div className="w-[340px] perspective-[2000px]">
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

                    {/* RIGHT COLUMN: THE LIST (Centered initially, moves right) */}
                    <motion.div
                        className="flex flex-col justify-center"
                        animate={{
                            width: activeService ? "50%" : "100%",
                            paddingLeft: activeService ? "4rem" : "0rem"
                            // When centered (100%), we want items centered? 
                            // The user said "Centralized". 
                        }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    >
                        {/* Header centered or aligned based on state */}
                        <motion.div
                            className="mb-12"
                            animate={{
                                textAlign: activeService ? "left" : "center",
                                scale: activeService ? 0.9 : 1
                            }}
                        >
                            <h2 className="text-sm font-body tracking-[0.5em] uppercase text-accent-gold mb-2">{dict.services.title}</h2>
                            <h3 className="text-4xl md:text-6xl font-headline uppercase text-white leading-none">
                                {activeService ? "Selected" : "Select Your"} <br /> {activeService ? "Service" : "Path"}
                            </h3>
                        </motion.div>

                        <ul className={`flex flex-col gap-6 w-full ${!activeService && "items-center"}`}>
                            {services.map((service, i) => {
                                const isActive = activeService?.slug === service.slug;

                                return (
                                    <li
                                        key={i}
                                        className="group cursor-pointer relative w-max"
                                        onMouseEnter={() => setActiveService(service as any)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs font-mono transition-colors ${isActive ? 'text-accent-gold' : 'text-white/20'}`}>
                                                0{i + 1}
                                            </span>
                                            <motion.div
                                                className="relative"
                                            >
                                                <h3 className={`text-2xl md:text-4xl font-headline uppercase transition-all duration-300 ${isActive ? "text-accent-gold" : "text-white/50 group-hover:text-white"}`}>
                                                    {service.title}
                                                </h3>
                                            </motion.div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <motion.div
                            className="mt-16"
                            animate={{
                                alignSelf: activeService ? "flex-start" : "center"
                            }}
                        >
                            <RGBButton href="/quote" text={dict.services.cta} />
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
