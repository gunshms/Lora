"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function UnicornBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
            <div
                className="aura-background-component absolute top-0 w-full h-full -z-10"
                data-alpha-mask="80"
                style={{ maskImage: "linear-gradient(transparent, black 0%, black 80%, transparent)" }}
            >
                <div className="absolute top-0 w-full h-full saturate-0">
                    <div
                        data-us-project="FixNvEwvWwbu3QX9qC3F"
                        className="absolute w-full h-full left-0 top-0 overflow-hidden"
                    >
                        <div
                            data-us-text="id-oibit0npjv07r8fdb8kfha"
                            style={{
                                width: "5px",
                                top: "418.405px",
                                left: "736.273px",
                                fontSize: "10px",
                                lineHeight: "65.1906px",
                                letterSpacing: "0px",
                                fontFamily: "Inter",
                                fontWeight: 400,
                                textAlign: "left",
                                position: "absolute",
                                wordBreak: "break-word",
                                transform: "rotateZ(0deg)",
                                color: "transparent",
                                zIndex: 2
                            }}
                        >
                            .
                        </div>
                    </div>
                </div>
            </div>
            <Script
                src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js"
                strategy="lazyOnload"
                onLoad={() => {
                    // @ts-ignore
                    if (window.UnicornStudio) {
                        // @ts-ignore
                        window.UnicornStudio.init();
                    }
                }}
            />
        </div>
    );
}
