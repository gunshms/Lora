"use client";

import Link from "next/link";
import React from "react";

export default function RGBButton({ href, text, onClick }: { href?: string; text: string; onClick?: () => void }) {
    const content = (
        <>
            <span className="font-body uppercase text-xs tracking-widest text-white group-hover:text-gray-200 transition-colors">
                {text}
            </span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
        </>
    );

    const containerClasses = "relative block px-8 py-4 bg-black rounded-lg leading-none flex items-center justify-center space-x-2 cursor-pointer";

    return (
        <div className="relative group inline-block">
            {/* Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-amber-400 to-[#EAC154] rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>

            {/* Border Line */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-orange-600 via-amber-400 to-[#EAC154] rounded-lg opacity-100 animate-gradient-xy"></div>

            {/* Button Content */}
            {onClick ? (
                <button onClick={onClick} className={containerClasses}>
                    {content}
                </button>
            ) : (
                <Link href={href || "#"} className={containerClasses}>
                    {content}
                </Link>
            )}
        </div>
    );
}
