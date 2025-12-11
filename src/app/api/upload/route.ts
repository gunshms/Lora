import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Helper to sanitize filename
const sanitize = (name: string) => name.replace(/[^a-z0-9\.\-_]/gi, '_').toLowerCase();

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const videoFile = formData.get("video") as File | null;
        const thumbnailFile = formData.get("thumbnail") as File | null;

        if (!videoFile) {
            return NextResponse.json({ error: "No video file provided" }, { status: 400 });
        }

        // Directories (ensure they exist)
        const publicDir = path.join(process.cwd(), "public");
        const uploadsVideoDir = path.join(publicDir, "uploads", "videos");
        const uploadsThumbDir = path.join(publicDir, "uploads", "thumbnails");
        const dbPath = path.join(process.cwd(), "src", "data", "db.json");

        // Save Video
        const videoBytes = await videoFile.arrayBuffer();
        const videoBuffer = Buffer.from(videoBytes);
        const videoName = sanitize(`${Date.now()}-${videoFile.name}`);
        const videoPath = path.join(uploadsVideoDir, videoName);
        await fs.writeFile(videoPath, videoBuffer);

        // Save Thumbnail (if provided)
        let thumbUrl = "https://placehold.co/600x400/202020/FFFFFF/png?text=Video";
        if (thumbnailFile && thumbnailFile.size > 0) {
            const thumbBytes = await thumbnailFile.arrayBuffer();
            const thumbBuffer = Buffer.from(thumbBytes);
            const thumbName = sanitize(`${Date.now()}-${thumbnailFile.name}`);
            const thumbPath = path.join(uploadsThumbDir, thumbName);
            await fs.writeFile(thumbPath, thumbBuffer);
            thumbUrl = `/uploads/thumbnails/${thumbName}`;
        }

        // --- Auto-Processing Logic ---
        // Infer Title from original filename (remove extension, replace special chars with spaces)
        const originalName = videoFile.name.replace(/\.[^/.]+$/, ""); // remove extension
        const rawTitle = originalName
            .replace(/[-_]/g, " ") // replace - _ with space
            .replace(/\s+/g, " ") // normalize spaces
            .trim();

        // Title Case Helper
        const title = rawTitle.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));

        // Infer Tags (naive approach) OR Use Manual Tags
        let finalTags: string[] = [];
        const manualTags = formData.get("tags") as string | null;

        if (manualTags && manualTags.trim() !== "") {
            // Priority: Manual Tags
            finalTags = manualTags.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
        } else {
            // Fallback: Auto-inference
            const commonWords = ['the', 'a', 'an', 'video', 'project', 'final', 'v1', 'v2', 'render', 'of', 'in', 'on', 'at', 'to', 'for'];
            finalTags = rawTitle.toLowerCase()
                .split(" ")
                .filter(word => word.length > 2 && !commonWords.includes(word));
        }

        // Add "New" tag if empty
        if (finalTags.length === 0) finalTags.push("new");


        // --- Update DB.json ---
        const dbData = JSON.parse(await fs.readFile(dbPath, "utf-8"));

        const newEntry = {
            id: Date.now().toString(),
            title: title,
            description: `Uploaded via Admin. Original file: ${videoFile.name}`,
            type: "video",
            videoSrc: `/uploads/videos/${videoName}`,
            thumbnailSrc: thumbUrl,
            tags: finalTags
        };

        dbData.unshift(newEntry); // Add to top

        await fs.writeFile(dbPath, JSON.stringify(dbData, null, 2));

        return NextResponse.json({ success: true, entry: newEntry });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server upload failed" }, { status: 500 });
    }
}
