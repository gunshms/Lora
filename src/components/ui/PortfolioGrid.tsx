"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export type PortfolioItem = {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'image';
    videoSrc?: string;
    thumbnailSrc: string;
    tags: string[];
};

export default function PortfolioGrid() {
    const { dict } = useLanguage();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Lightbox State
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Add a timestamp to prevent caching
                const res = await fetch(`/api/portfolio?t=${Date.now()}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setItems(data);
                }
            } catch (e) {
                console.error("Failed to fetch portfolio", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        items.forEach(item => item.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesTag = selectedTag ? item.tags.includes(selectedTag) : true;
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTag && matchesSearch;
        });
    }, [items, selectedTag, searchQuery]);

    const selectedItem = items.find(item => item.id === selectedId);

    if (loading && items.length === 0) {
        return <div className="w-full text-center py-20 text-white/40">{dict.portfolio.loading}</div>;
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-20 relative z-20">
            {/* Lightbox Overlay */}
            <AnimatePresence>
                {selectedId && selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-12 cursor-pointer"
                        onClick={() => setSelectedId(null)} // Close on bg click
                    >
                        <motion.div
                            layoutId={`card-${selectedId}`}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()} // Prevent close when clicking video
                        >
                            {selectedItem.type === 'video' && selectedItem.videoSrc ? (
                                <video
                                    src={selectedItem.videoSrc}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img src={selectedItem.thumbnailSrc} className="w-full h-full object-contain" />
                            )}

                            {/* Overlay Info (Optional) */}
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                                <h3 className="text-3xl font-headline uppercase text-white">{selectedItem.title}</h3>
                                <p className="text-white/70 text-sm mt-2">{selectedItem.description}</p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-8 mb-12">
                <div className="flex justify-between items-end">
                    <h2 className="text-4xl md:text-6xl font-headline uppercase text-white">{dict.portfolio.title}</h2>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest pointer-events-none opacity-50 hidden md:block">
                        {dict.portfolio.adminHint}
                    </span>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-4 py-1 rounded-full border text-sm uppercase tracking-wider transition-colors ${!selectedTag ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/20 hover:border-white/50'}`}
                        >
                            {dict.portfolio.all}
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={`px-4 py-1 rounded-full border text-sm uppercase tracking-wider transition-colors ${tag === selectedTag ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/20 hover:border-white/50'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder={dict.portfolio.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-b border-white/20 py-2 px-0 text-white placeholder-white/40 focus:outline-none focus:border-white w-full md:w-64 font-body uppercase tracking-widest text-sm"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                        <PortfolioCard
                            key={item.id}
                            item={item}
                            onClick={() => setSelectedId(item.id)} // Open Lightbox
                        />
                    ))}
                </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-white/40 uppercase tracking-widest">
                    {dict.portfolio.empty}
                </div>
            )}
        </section>
    );
}

function PortfolioCard({ item, onClick }: { item: PortfolioItem, onClick: () => void }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layoutId={`card-${item.id}`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative w-full aspect-video bg-white/5 border border-white/10 overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Thumbnail / Video Preview */}
            <div className="absolute inset-0">
                {item.type === 'video' && isHovered && item.videoSrc ? (
                    <video
                        src={item.videoSrc}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                ) : (
                    <img src={item.thumbnailSrc} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                )}

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-widest bg-black/50 px-2 py-0.5 backdrop-blur-sm text-white/80">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h3 className="text-2xl font-headline uppercase text-white mb-1 shadow-black drop-shadow-md">{item.title}</h3>
                </div>
            </div>

            {/* Hover overlay hint */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
}
