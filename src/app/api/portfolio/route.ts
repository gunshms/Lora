import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "data", "db.json");

// Define type for data consistency
type PortfolioItem = {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'image';
    videoSrc: string; // YouTube URL
    youtubeId?: string; // Extracted ID
    thumbnailSrc?: string; // Optional (derived from YouTube)
    tags: string[];
    order?: number;
};

// GET: List all items, sorted by 'order'
export async function GET() {
    try {
        const data: PortfolioItem[] = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        // Sort by order capability (ascending)
        const sorted = data.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        return NextResponse.json(sorted);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}

// Helper to extract YouTube ID
const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// POST: Create a new item (YouTube Link)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, videoUrl, tags } = body;

        if (!videoUrl) return NextResponse.json({ error: "Missing YouTube URL" }, { status: 400 });

        const youtubeId = getYouTubeId(videoUrl);
        if (!youtubeId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

        const data: PortfolioItem[] = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        const newItem: PortfolioItem = {
            id: Date.now().toString(),
            title: title || "New Video",
            description: "YouTube Import",
            type: 'video',
            videoSrc: videoUrl,
            youtubeId: youtubeId,
            tags: tags || ['new'],
            order: -1 // Top priority
        };

        // Add to top
        data.unshift(newItem);

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        return NextResponse.json({ error: "Creation failed" }, { status: 500 });
    }
}

// PUT: Update an item or reorder bulk
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();

        // Bulk reorder
        if (Array.isArray(body)) {
            const data: PortfolioItem[] = JSON.parse(await fs.readFile(dbPath, "utf-8"));

            // Map the new order from the body
            const newOrderInitial = body as PortfolioItem[];

            // Update the local data
            newOrderInitial.forEach((item, idx) => {
                const existing = data.find(d => d.id === item.id);
                if (existing) {
                    existing.order = idx;
                }
            });

            await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
            return NextResponse.json({ success: true });
        }

        // Single Update
        const { id, title, tags, order } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const data: PortfolioItem[] = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const index = data.findIndex(item => item.id === id);

        if (index === -1) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        // Update fields
        if (title !== undefined) data[index].title = title;
        if (tags !== undefined) data[index].tags = tags;
        if (order !== undefined) data[index].order = order;
        if (body.thumbnailSrc !== undefined) data[index].thumbnailSrc = body.thumbnailSrc;

        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

        return NextResponse.json({ success: true, item: data[index] });
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

// DELETE: Remove an item
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        let data: PortfolioItem[] = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        // Find item to (optionally) delete files - for now we just remove DB entry to be safe/fast
        const filteredData = data.filter(item => item.id !== id);

        await fs.writeFile(dbPath, JSON.stringify(filteredData, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
