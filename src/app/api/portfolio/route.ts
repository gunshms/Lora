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
    videoSrc?: string;
    thumbnailSrc: string;
    tags: string[];
};

// GET: List all items
export async function GET() {
    try {
        const data = await fs.readFile(dbPath, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}

// PUT: Update an item
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, title, tags } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const data: PortfolioItem[] = JSON.parse(await fs.readFile(dbPath, "utf-8"));
        const index = data.findIndex(item => item.id === id);

        if (index === -1) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        // Update fields
        if (title) data[index].title = title;
        if (tags) data[index].tags = tags;

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
