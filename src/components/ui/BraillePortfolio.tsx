"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function BraillePortfolio() {
    const { dict } = useLanguage();

    // In a real app, projects might come from a CMS. 
    // Here we map the static projects but pull category names or titles if they were localized.
    const projects = dict.portfolio.items;

    // Map projects to generated thumbnails
    const imageMap: Record<string, string> = {
        "Névoa Digital": "/thumb_creative.png",
        "Digital Mist": "/thumb_creative.png",
        "Santhomè": "/thumb_branding.png",
        "Aurum 99": "/thumb_design.png"
    };

    return (
        <section id="portfolio" className="relative w-full py-24 md:py-32 px-4 md:px-12 z-20 bg-bg-base/50 backdrop-blur-sm border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-sm font-body tracking-[0.3em] uppercase mb-12 text-accent-gold">{dict.portfolio.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, i) => (
                        <div key={i} className="group relative aspect-video bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden cursor-pointer">
                            {/* Generated Thumbnail */}
                            <img
                                src={imageMap[project.title] || "/thumb_editing.png"}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Glass Overlay & Light Sweep Interaction */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 z-10">
                                <h3 className="text-3xl font-headline uppercase leading-none mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{project.title}</h3>
                                <p className="text-xs font-body uppercase tracking-wider text-gray-400 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{project.category}</p>
                            </div>

                            {/* Interactive Light Sweep */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-sweep opacity-0 group-hover:opacity-100" />
                        </div>
                    ))}
                </div>
                <div className="mt-12 w-full flex justify-end">
                    <button className="text-sm font-body uppercase tracking-widest border-b border-white/20 hover:border-white hover:text-white transition-colors pb-1">{dict.portfolio.cta}</button>
                </div>
            </div>
        </section>
    )
}
