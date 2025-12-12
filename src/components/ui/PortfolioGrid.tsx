"use client";

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export type PortfolioItem = {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'image';
    videoSrc: string; // YouTube URL
    youtubeId?: string; // YouTube ID
    thumbnailSrc?: string; // Optional/Legacy
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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

    const [limit, setLimit] = useState(3); // Default show 3

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

    const visibleItems = useMemo(() => {
        if (selectedTag || searchQuery) return filteredItems;
        return filteredItems.slice(0, limit);
    }, [filteredItems, limit, selectedTag, searchQuery]);

    const showSeeMore = !selectedTag && !searchQuery && filteredItems.length > limit;

    const selectedItem = items.find(item => item.id === selectedId);

    const lightbox = (
        <AnimatePresence>
            {selectedId && selectedItem && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-pointer touch-none"
                    onClick={() => setSelectedId(null)}
                    onAnimationStart={() => document.body.style.overflow = 'hidden'}
                    onAnimationComplete={(def) => {
                        if (def === "exit") document.body.style.overflow = 'auto';
                    }}
                >
                    <motion.div
                        layoutId={`card-${selectedId}`}
                        className="relative w-full max-w-7xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 z-[100000] cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedItem.youtubeId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedItem.youtubeId}?autoplay=1&rel=0&showinfo=0`}
                                title={selectedItem.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50">Video Error</div>
                        )}

                        <button
                            onClick={() => setSelectedId(null)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors text-white z-[100001] border border-white/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (loading && items.length === 0) {
        return <div className="w-full text-center py-20 text-white/40">{dict.portfolio.loading}</div>;
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-20 relative z-20">
            {/* Render Portal if mounted */}
            {mounted && createPortal(lightbox, document.body)}

            <div className="flex flex-col gap-8 mb-12">
                {/* Header and Controls */}
                <div className="flex justify-between items-end">
                    <h2 className="text-4xl md:text-6xl font-headline uppercase text-white">{dict.portfolio.title}</h2>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest pointer-events-none opacity-50 hidden md:block">
                        {dict.portfolio.adminHint}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
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
                    {visibleItems.map((item) => (
                        <PortfolioCard
                            key={item.id}
                            item={item}
                            onClick={() => setSelectedId(item.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {showSeeMore && (
                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => setLimit(prev => prev + 3)}
                        className="text-sm uppercase tracking-widest text-white/60 hover:text-white border-b border-white/20 hover:border-white pb-1 transition-all"
                    >
                        See More
                    </button>
                </div>
            )}

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

    // YouTube Thumbnail Construction
    // maxresdefault is best, but hqdefault is safer fallback. We can try maxresdefault.
    const thumbUrl = item.thumbnailSrc || (item.youtubeId
        ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
        : "https://placehold.co/600x400/000000/FFFFFF/png?text=No+ID");

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
            {/* Thumbnail */}
            <div className="absolute inset-0">
                <img
                    src={thumbUrl}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors" />

                {/* Play Icon Hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ml-1">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {item.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-widest bg-black/70 px-2 py-0.5 backdrop-blur-sm text-white/90">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h3 className="text-xl font-headline uppercase text-white mb-1 shadow-black drop-shadow-md leading-none truncate">{item.title}</h3>
                </div>
            </div>
        </motion.div>
    );
}
