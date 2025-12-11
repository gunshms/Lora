"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Helper to find service by slug
const getServiceBySlug = (slug: string, services: any[]) => {
    return services.find((s: any) => s.slug === slug);
};

export default function ServicePage({ params }: { params: { slug: string } }) {
    const { dict } = useLanguage();
    const service = getServiceBySlug(params.slug, dict.services.list);

    // Map slugs to generated images
    const imageMap: Record<string, string> = {
        "content-manager": "/thumb_editing.png",
        "branded-content": "/thumb_branding.png",
        "creative-direction": "/thumb_creative.png",
        "video-editing": "/thumb_editing.png",
        "mentorship": "/thumb_mentorship.png"
    };

    // Fallback if image not generated yet or mapped
    const imagePath = imageMap[params.slug] || "/thumb_design.png";

    if (!service) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-bg-base text-white">
                <p>Service not found.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-bg-base text-white pt-32 px-4 md:px-12">
            <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-white/50 hover:text-white mb-12 transition-colors">
                <ArrowLeft size={16} /> {dict.services.title === "Serviços" ? "Voltar" : "Back"}
            </Link>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Visual */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl glass-panel group">
                    <img
                        src={imagePath}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div>
                    <h1 className="text-5xl md:text-7xl font-headline uppercase leading-none mb-4 text-accent-gold">
                        {service.title}
                    </h1>
                    <div className="w-24 h-[1px] bg-white/20 mb-8" />

                    <p className="text-xl font-body leading-relaxed text-white/80 mb-8 max-w-lg">
                        {service.details}
                    </p>

                    {/* Features List */}
                    {service.features && (
                        <ul className="mb-12 space-y-4">
                            {service.features.map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-3 text-white/70 font-body text-sm uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex gap-4">
                        <Link href="/quote" className="px-8 py-4 bg-white text-black font-body uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors">
                            {dict.services.cta}
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
