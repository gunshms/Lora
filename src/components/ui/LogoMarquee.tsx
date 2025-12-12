"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ClientModal, { ClientData } from "./ClientModal";

const CLIENTS: ClientData[] = [
    {
        id: "mancity",
        name: "Manchester City",
        logo: "/logos/manchester-city.png",
        description: "Parceria Oficial. Atuamos diretamente em conjunto com o clube na estratégia e produção de conteúdo, realizando a edição de vídeos para grandes nomes como Kevin De Bruyne e Gleyverson Duarte, garantindo qualidade cinematográfica e alto engajamento."
    },
    {
        id: "newcastle",
        name: "Newcastle United",
        logo: "/logos/newcastle.png",
        description: "Design & Performance. Fomos contatados pelo clube para uma parceria exclusiva focada no design visual e edição de conteúdo para seus atletas. Entregamos um trabalho de excelência que elevou a presença digital do jogador."
    },
    {
        id: "pbex",
        name: "PBEX",
        logo: "/logos/pbex.png",
        description: "Cobertura Global. Em parceria com a Ubrandy, gerenciamos toda a comunicação visual e a cobertura das palestras diárias da PBEX, coordenando a adaptação e transmissão de conteúdo para múltiplos idiomas."
    },
    {
        id: "ubrandy",
        name: "Ubrandy",
        logo: "/logos/youbrand.jpg",
        description: "Evolução Digital. Trabalhamos lado a lado com a Ubrandy para reestruturar e potencializar suas redes sociais, focando em estética high-end e estratégias de crescimento."
    },
    {
        id: "gleyverson",
        name: "Gleyverson Duarte",
        logo: "/logos/geiverson-duarte.png",
        description: "Gestão 360°. Durante um ano de trabalho intensivo, assumimos a gerência completa de conteúdo. Elevamos o nível de produção, lançamos seu infoproduto e transformamos sua marca pessoal em uma empresa altamente lucrativa com uma comunidade fiel."
    }
];

const LogoItem = ({ client, uniqueId, onClick }: { client: ClientData; uniqueId: string; onClick: (c: ClientData, id: string) => void }) => (
    <motion.div
        layoutId={uniqueId}
        onClick={() => onClick(client, uniqueId)}
        className="h-24 w-40 relative group flex items-center justify-center p-4 rounded-xl hover:bg-white/5 hover:backdrop-blur-sm hover:border hover:border-white/10 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className="relative w-full h-full opacity-100 group-hover:opacity-100 transition-opacity filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            <Image
                src={client.logo}
                alt={client.name}
                fill
                className="object-contain"
            />
        </div>
    </motion.div>
);

export default function LogoMarquee() {
    const [selectedClient, setSelectedClient] = useState<{ data: ClientData; layoutId: string } | null>(null);

    return (
        <>
            <section className="w-full relative overflow-hidden py-8 border-y border-white/10 z-20">
                <div className="flex w-full overflow-hidden mask-gradient-fade">
                    <div className="flex animate-marquee whitespace-nowrap gap-x-16 items-center w-max min-w-full">
                        {/* Loop 4 times to fill screen + duplicate for seamless scroll */}
                        {[...Array(8)].map((_, groupIndex) => (
                            <React.Fragment key={groupIndex}>
                                {CLIENTS.map((client, clientIndex) => {
                                    const uniqueId = `logo-${client.id}-${groupIndex}-${clientIndex}`;
                                    return (
                                        <LogoItem
                                            key={uniqueId}
                                            client={client}
                                            uniqueId={uniqueId}
                                            onClick={(c, id) => setSelectedClient({ data: c, layoutId: id })}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            <ClientModal
                client={selectedClient?.data || null}
                layoutId={selectedClient?.layoutId}
                onClose={() => setSelectedClient(null)}
            />
        </>
    );
}
