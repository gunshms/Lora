"use client";

import Link from "next/link";
import React from "react";

export default function RGBButton({ href, text }: { href: string; text: string }) {
    return (
        <div className="relative group inline-block">
            {/* 
        The "Glow" Blur Background
        This creates the fuzzy colored light around the button.
        We use a conic gradient that spins.
      */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-amber-400 to-[#EAC154] rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>

            {/* 
        The "Border" Line
        This sits just behind the button content to create the sharp border effect.
      */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-orange-600 via-amber-400 to-[#EAC154] rounded-lg opacity-100 animate-gradient-xy"></div>

            {/* 
        The Button Content
        Solid black background to hide the center of the gradients.
      */}
            <Link
                href={href}
                className="relative block px-8 py-4 bg-black rounded-lg leading-none flex items-center justify-center space-x-2"
            >
                <span className="font-body uppercase text-xs tracking-widest text-white group-hover:text-gray-200 transition-colors">
                    {text}
                </span>
                {/* Arrow Icon */}
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
            </Link>
        </div>
    );
}
