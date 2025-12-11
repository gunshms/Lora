"use client";



import React from "react";
import Image from "next/image";

const LogoWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="h-24 w-40 relative group flex items-center justify-center p-4 rounded-xl hover:bg-white/5 hover:backdrop-blur-sm hover:border hover:border-white/10 transition-all duration-300 cursor-pointer">
        <div className="relative w-full h-full opacity-100 group-hover:opacity-100 transition-opacity filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            {children}
        </div>
    </div>
);

const ManCityLogo = () => (
    <LogoWrapper>
        <Image src="/logos/manchester-city.png" alt="Manchester City" fill className="object-contain" />
    </LogoWrapper>
);

const NewcastleLogo = () => (
    <LogoWrapper>
        <Image src="/logos/newcastle.png" alt="Newcastle United" fill className="object-contain" />
    </LogoWrapper>
);

const PBEXLogo = () => (
    <LogoWrapper>
        <Image src="/logos/pbex.png" alt="PBEX" fill className="object-contain" />
    </LogoWrapper>
);

const YoubrandLogo = () => (
    <LogoWrapper>
        <Image src="/logos/youbrand.jpg" alt="Youbrand" fill className="object-contain" />
    </LogoWrapper>
);

const GeiversonDuarteLogo = () => (
    <LogoWrapper>
        <Image src="/logos/geiverson-duarte.png" alt="Geiverson Duarte" fill className="object-contain" />
    </LogoWrapper>
);

const LogoGroup = () => (
    <div className="flex items-center gap-16 mx-8 shrink-0">
        {/* Repeating the set multiple times to ensure one 'group' is wider than any screen */}
        {[1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
                <ManCityLogo />
                <NewcastleLogo />
                <PBEXLogo />
                <YoubrandLogo />
                <GeiversonDuarteLogo />
                <ManCityLogo />
                <NewcastleLogo />
                <PBEXLogo />
                <YoubrandLogo />
                <GeiversonDuarteLogo />
            </React.Fragment>
        ))}
    </div>
);

export default function LogoMarquee() {
    return (
        <section className="w-full relative overflow-hidden py-8 border-y border-white/10 z-20">
            <div className="flex w-full overflow-hidden mask-gradient-fade">
                <div className="flex animate-marquee whitespace-nowrap gap-x-16 items-center w-max min-w-full">
                    <LogoGroup />
                    <LogoGroup />
                </div>
            </div>
        </section>
    );
}
