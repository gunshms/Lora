export type Dictionary = typeof dictionary.pt;

export const dictionary = {
    pt: {
        hero: {
            triad: "Do Bruto • Ao • Memorável",
            scroll: "Scroll"
        },
        services: {
            title: "Serviços",
            cta: "Fazer Orçamento",
            list: [
                {
                    slug: "content-manager",
                    title: "Gerente de Conteúdo",
                    description: "Estratégia editorial completa: Edição, programação e roteiro.",
                    details: "Gerenciamos seu canal de ponta a ponta. Focamos na retenção (Watchtime) e no crescimento orgânico, garantindo que seu conteúdo não seja apenas visto, mas lembrado.",
                    cover: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop", // Social Media/Content
                    features: [
                        "Programação de Postagens (Youtube, Insta, TikTok)",
                        "Roteirização focada em retenção (Hooks Virais)",
                        "Análise de Métricas e Ajustes de Rota",
                        "Gestão de Comunidade"
                    ]
                },
                {
                    slug: "branded-content",
                    title: "Conteúdo de Marca",
                    description: "Criação de identidade visual e storytelling imersivo.",
                    details: "Desenvolvemos a cara da sua marca no digital. Não é apenas logo, é um ecossistema visual que comunica autoridade, inovação e o estilo 'High-End' que você procura.",
                    cover: "https://images.unsplash.com/photo-1493612276216-9c5901955d43?q=80&w=600&auto=format&fit=crop", // Brand/Minimalist
                    features: [
                        "Identidade Visual Completa (Logo, Cores, Tipografia)",
                        "Manual de Marca (Brandbook)",
                        "Assets para Redes Sociais",
                        "Storytelling Guiado"
                    ]
                },
                {
                    slug: "creative-direction",
                    title: "Direção Criativa",
                    description: "Conceito, Motion Design e visão artística unificada.",
                    details: "A alma do projeto. Definimos a direção de arte e o conceito geral. Utilizamos Motion Design e referências cinematográficas para elevar o nível da produção.",
                    cover: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&auto=format&fit=crop", // Art/Creative
                    features: [
                        "Supervisão Artística de Projetos",
                        "Motion Design Avançado (2D/3D)",
                        "Concepção de Campanhas",
                        "Moodboards e Styleframes"
                    ]
                },
                {
                    slug: "video-editing",
                    title: "Edição de Vídeo",
                    description: "Cortes de alta retenção. Portfolio: MasterCity, Newcastle.",
                    details: "Edição dinâmica focada em watchtime. Já trabalhamos com gigantes como MasterCity e Newcastle, entregando cortes que prendem a atenção do primeiro ao último segundo.",
                    cover: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44c?q=80&w=600&auto=format&fit=crop", // Editing Timeline
                    features: [
                        "Edição de Vídeos Longos (Vlogs, Documentários)",
                        "Cortes para Reels/TikTok (Short-form)",
                        "Sound Design Imersivo",
                        "Color Grading Cinematográfico"
                    ]
                },
                {
                    slug: "mentorship",
                    title: "Mentoria",
                    description: "Te ensinamos a ser um editor e criador melhor.",
                    details: "Acelere sua curva de aprendizado. Compartilhamos nossos processos, técnicas de edição no Premiere/After Effects e os segredos de viralização que usamos na Lora Studio.",
                    cover: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop", // Classroom/Learning
                    features: [
                        "Aula 1:1 com nossos Experts",
                        "Análise de Canal e Portfolio",
                        "Workflows de Edição e Produtividade",
                        "Técnicas de Storytelling Viral"
                    ]
                }
            ]
        },
        portfolio: {
            title: "Trabalhos Selecionados",
            all: "Todos",
            cta: "Ver Reels",
            adminHint: "Portal Admin: /admin",
            searchPlaceholder: "BUSCAR...",
            loading: "Carregando galeria...",
            empty: "Nenhum projeto encontrado",
            items: [
                { title: "Névoa Digital", category: "Direção de Movimento" },
                { title: "Santhomè", category: "Experiência de Marca" },
                { title: "Aurum 99", category: "Revelação de Produto 3D" }
            ]
        },
        founders: {
            title: "Fundadores & Sócios",
            gustavo: {
                name: "Gustavo Henrique Lora",
                role: "CEO",
                bio: "Liderando a visão estratégica e a expansão global da Lora Studio."
            },
            guilherme: {
                name: "Guilherme Duarte",
                role: "CEO",
                bio: "Mestre na execução criativa e na arquitetura de narrativas virais."
            }
        },
        manifesto: {
            label: "Manifesto",
            headline: "Do Bruto ao Memorável.",
            subheadline: "Elevando o padrão.",
            text: "Não entregamos apenas vídeos. Transformamos filmagens brutas em narrativas que marcam, engajam e se tornam inesquecíveis."
        },
        contact: {
            location: "São Paulo — Global",
            rights: "© 2025 Lora Studio. Todos os direitos reservados."
        },
        quote: {
            title: "Fazer Orçamento",
            subtitle: "Vamos criar algo lendário juntos.",
            form: {
                name: "Nome",
                email: "Email",
                project: "Sobre o Projeto",
                send: "Enviar Proposta"
            }
        }
    },
    en: {
        hero: {
            triad: "Video • Life • Viral (VLV)",
            scroll: "Scroll"
        },
        services: {
            title: "Services",
            cta: "Get a Quote",
            list: [
                {
                    slug: "content-manager",
                    title: "Content Manager",
                    description: "Full editorial strategy: Editing, scheduling, and scripting.",
                    details: "We manage your channel end-to-end. We focus on retention (Watchtime) and organic growth, ensuring your content is not just seen, but remembered.",
                    features: [
                        "Post Scheduling (Youtube, Insta, TikTok)",
                        "Retention-Focused Scripting (Viral Hooks)",
                        "Analytics & Route Adjustments",
                        "Community Management"
                    ]
                },
                {
                    slug: "branded-content",
                    title: "Branded Content",
                    description: "Visual identity creation and immersive storytelling.",
                    details: "We develop your brand's digital face. Not just a logo, but a visual ecosystem that communicates authority, innovation, and the 'High-End' style you seek.",
                    features: [
                        "Full Visual Identity (Logo, Colors, Typography)",
                        "Brandbook",
                        "Social Media Assets",
                        "Guided Storytelling"
                    ]
                },
                {
                    slug: "creative-direction",
                    title: "Creative Direction",
                    description: "Concept, Motion Design, and unified artistic vision.",
                    details: "The soul of the project. We define art direction and the general concept. We use Advanced Motion Design and cinematic references to elevate production quality.",
                    features: [
                        "Artistic Project Supervision",
                        "Advanced Motion Design (2D/3D)",
                        "Campaign Perception",
                        "Moodboards & Styleframes"
                    ]
                },
                {
                    slug: "video-editing",
                    title: "Video Editing",
                    description: "High-retention cuts. Portfolio: MasterCity, Newcastle.",
                    details: "Dynamic editing focused on watch time. Worked with giants like MasterCity and Newcastle, delivering cuts that hold attention from the first to the last second.",
                    features: [
                        "Long-form Video Editing (Vlogs, Docs)",
                        "Short-form Cuts (Reels/TikTok)",
                        "Immersive Sound Design",
                        "Cinematic Color Grading"
                    ]
                },
                {
                    slug: "mentorship",
                    title: "Mentorship",
                    description: "We help you become a better editor and creator.",
                    details: "Accelerate your learning curve. We share our processes, Premiere/After Effects techniques, and the viralization secrets we use at Lora Studio.",
                    features: [
                        "1:1 Session with our Experts",
                        "Channel & Portfolio Analysis",
                        "Editing & Productivity Workflows",
                        "Viral Storytelling Techniques"
                    ]
                }
            ]
        },
        portfolio: {
            title: "Selected Works",
            all: "All",
            cta: "View Reels",
            adminHint: "Admin Portal: /admin",
            searchPlaceholder: "SEARCH...",
            loading: "Loading gallery...",
            empty: "No projects found",
            items: [
                { title: "Digital Mist", category: "Motion Direction" },
                { title: "Santhomè", category: "Brand Experience" },
                { title: "Aurum 99", category: "3D Product Reveal" }
            ]
        },
        founders: {
            title: "Founders & Partners",
            gustavo: {
                name: "Gustavo Henrique Lora",
                role: "CEO",
                bio: "Leading the strategic vision and global expansion of Lora Studio."
            },
            guilherme: {
                name: "Guilherme Duarte",
                role: "CEO",
                bio: "Master of creative execution and the architecture of viral narratives."
            }
        },
        manifesto: {
            label: "Manifesto",
            headline: "Video. Life. Viral.",
            subheadline: "Sculpting the (VLV).",
            text: "Digital matter is fluid. We take the discipline of the Old Masters—lighting, form, tension—and shatter it through the lens of real-time rendering."
        },
        contact: {
            location: "São Paulo — Global",
            rights: "© 2025 Lora Studio. All Rights Reserved."
        },
        quote: {
            title: "Get a Quote",
            subtitle: "Let's create something legendary together.",
            form: {
                name: "Name",
                email: "Email",
                project: "About the Project",
                send: "Send Proposal"
            }
        }
    }
};
