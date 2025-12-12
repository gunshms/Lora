"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Bookmark, Clock, Music } from "lucide-react";

interface ServiceCardProps {
    title: string;
    description: string;
    cover: string;
    progress: number; // 0 to 100
    indexLabel: string; // e.g. "01/05"
    className?: string; // Allow override for absolute positioning
    style?: React.CSSProperties;
}

export default function ServiceCard({ title, description, cover, progress, indexLabel, className, style }: ServiceCardProps) {
    return (
        <motion.div
            initial={{ rotateY: -90, opacity: 0, x: 50, scale: 0.9 }}
            animate={{ rotateY: 0, opacity: 1, x: 0, scale: 1 }}
            exit={{ rotateY: 90, opacity: 0, x: -50, scale: 0.9, transition: { duration: 0.3, ease: "easeInOut" } }}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
            style={style}
            // Added bg-[#0a0a0a] to prevent transparency bleed-through
            className={`relative overflow-hidden w-full max-w-sm h-96 sm:h-[32rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-[2rem] z-40 border border-white/10 backdrop-blur-sm bg-[#0a0a0a] ${className || ''}`}
        >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
                {cover ? (
                    <Image src={cover} alt={title} fill className="object-cover transform hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-neutral-900" />
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>

            {/* Top Left: Now Playing (Service Name) */}
            <div className="absolute top-4 left-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full border border-white/20 bg-black/40 flex items-center justify-center backdrop-blur-md">
                        <Music className="w-3 h-3 text-accent-gold animate-pulse" />
                    </div>
                </div>
                <div className="backdrop-blur-md rounded-lg p-2 bg-white/5 border border-white/5 inline-block">
                    <p className="text-[10px] uppercase tracking-widest leading-tight font-body text-white/90">
                        Playing: <span className="text-accent-gold font-bold">{title}</span>
                    </p>
                </div>
            </div>

            {/* Top Right: Index */}
            <div className="absolute top-4 right-4">
                <span className="text-4xl font-headline text-white/10">{indexLabel}</span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-6 left-4 right-4">
                <div className="backdrop-blur-xl rounded-2xl p-5 bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group">
                    {/* Glass Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex flex-col gap-3">
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <span className="font-headline text-2xl uppercase text-white tracking-wide drop-shadow-lg">{title}</span>
                            <button className="text-white/80 hover:text-accent-gold transition-colors">
                                <Play className="w-5 h-5 fill-current" />
                            </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs font-body text-white/70 leading-relaxed pt-2">
                            {description}
                        </p>

                        {/* Progressive Bar */}
                        <div className="flex items-center gap-3 mt-4">
                            <span className="text-[10px] text-white/40 font-mono">00:00</span>
                            <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-gold to-orange-500 shadow-[0_0_10px_rgba(234,193,84,0.5)]"
                                />
                            </div>
                            <span className="text-[10px] text-white/40 font-mono">
                                {Math.floor(progress / 10)}:00
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
