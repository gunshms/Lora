export default function ProjectThumbnail({ title, category }: { title: string, category: string }) {
    // Deterministic "random" gradient based on title length/char
    const hue = title.length * 15 % 360;
    const gradient = `linear-gradient(135deg, hsl(${hue}, 20%, 10%) 0%, hsl(${hue}, 30%, 5%) 100%)`;

    return (
        <div className="w-full h-full relative overflow-hidden" style={{ background: gradient }}>
            {/* Abstract SVG Pattern */}
            <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 opacity-20 mix-blend-overlay">
                <mask id="mask">
                    <rect width="1920" height="100" y="440" fill="white" />
                </mask>
                <rect width="1920" height="1080" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 20" />
                <circle cx="960" cy="540" r="400" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M0 1080 L1920 0" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
            </svg>

            {/* Generated Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-24 h-24 mb-6 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="text-white/40 text-xs font-headline uppercase tracking-widest">VVV</span>
                </div>
            </div>

            {/* Minimal Stamp */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-50">
                <div className="w-2 h-2 bg-accent-gold rounded-full" />
                <span className="text-[10px] uppercase font-body tracking-widest text-white/60">Lora Studio</span>
            </div>
        </div>
    )
}
