export type PortfolioItem = {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'image';
    videoSrc?: string; // Path to video file in public/videos or external URL
    thumbnailSrc: string;
    tags: string[];
};

export const portfolioData: PortfolioItem[] = [
    {
        id: '1',
        title: 'Neon Nights',
        description: 'A dark, atmospheric exploration of city lights.',
        type: 'video',
        videoSrc: '/videos/example1.mp4',
        thumbnailSrc: 'https://placehold.co/600x400/101010/FFFFFF/png?text=Neon+Nights',
        tags: ['dark', 'urban', 'concept'],
    },
    {
        id: '2',
        title: 'Golden Hour',
        description: 'Cinematic sunlight captures.',
        type: 'video',
        videoSrc: '/videos/example2.mp4',
        thumbnailSrc: 'https://placehold.co/600x400/D4A12A/000000/png?text=Golden+Hour',
        tags: ['light', 'nature', 'cinematic'],
    },
    {
        id: '3',
        title: 'Product Flow',
        description: 'High-energy product commercial edit.',
        type: 'video',
        videoSrc: '/videos/example3.mp4',
        thumbnailSrc: 'https://placehold.co/600x400/202020/FFFFFF/png?text=Product+flow',
        tags: ['commercial', 'dynamic', 'product'],
    },
    {
        id: '4',
        title: 'Dark Concept',
        description: 'Abstract visual effects.',
        type: 'video',
        videoSrc: '/videos/example4.mp4',
        thumbnailSrc: 'https://placehold.co/600x400/000000/333333/png?text=Dark+Concept',
        tags: ['dark', 'vfx', 'abstract'],
    },
];
