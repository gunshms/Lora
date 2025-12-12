"use client";

import { useState, useEffect, useRef } from "react";

type PortfolioItem = {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'image';
    videoSrc?: string;
    youtubeId?: string; // Added field
    thumbnailSrc: string;
    tags: string[];
    order?: number;
};

export default function AdminPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [isDirty, setIsDirty] = useState(false); // Track if order changed

    // Fetch items
    const fetchItems = async () => {
        try {
            const res = await fetch(`/api/portfolio?t=${Date.now()}`);
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (e) { console.error(e) } finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, []);

    // ... (handleUpload, handleDelete, handleUpdate existing code)
    async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setUploading(true);
        setMessage("");

        const formData = new FormData(event.currentTarget);
        const videoUrl = formData.get("videoUrl") as string;
        const title = formData.get("title") as string;
        const manualTags = formData.get("tags") as string;

        try {
            const tagsArray = manualTags
                ? manualTags.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
                : [];

            const res = await fetch('/api/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoUrl,
                    title,
                    tags: tagsArray
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Added successfully!");
                (event.target as HTMLFormElement).reset();
                fetchItems();
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }

        } catch (error: any) {
            console.error(error);
            setMessage(`❌ Error: ${error.message || "Failed"}`);
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this video?")) return;
        try {
            const res = await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchItems();
        } catch (e) { alert("Failed to delete"); }
    }

    async function handleUpdate(id: string, newTitle: string, newTags: string, newThumbnail: string) {
        const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t);
        try {
            const res = await fetch('/api/portfolio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title: newTitle, tags: tagsArray, thumbnailSrc: newThumbnail })
            });
            if (res.ok) {
                alert("Updated!");
                fetchItems();
            }
        } catch (e) { alert("Failed to update"); }
    }

    // --- DRAG AND DROP HANDLERS ---
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
        // Optional: visual feedback for drop target
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50');

        if (dragItem.current !== null && dragOverItem.current !== null) {
            const copyListItems = [...items];
            const dragItemContent = copyListItems[dragItem.current];
            copyListItems.splice(dragItem.current, 1);
            copyListItems.splice(dragOverItem.current, 0, dragItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
            setItems(copyListItems);
            setIsDirty(true);
        }
    };

    const saveOrder = async () => {
        try {
            const res = await fetch('/api/portfolio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items) // Send entire array to reorder
            });
            if (res.ok) {
                alert("Order Saved!");
                setIsDirty(false);
                fetchItems(); // Refresh to be sure
            }
        } catch (e) { alert("Failed to save order"); }
    };


    return (
        <div className="min-h-screen w-full bg-black text-white p-8 pt-24 font-body">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* --- UPLOAD SECTION --- */}
                <div className="border border-white/20 p-8 rounded-2xl bg-white/5 backdrop-blur-md h-fit">
                    <h1 className="text-3xl font-headline uppercase mb-8 text-center">New Upload</h1>

                    <form onSubmit={handleUpload} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">YouTube URL</label>
                            <input
                                type="text"
                                name="videoUrl"
                                placeholder="https://youtube.com/watch?v=..."
                                required
                                className="bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-white/50 outline-none text-white font-mono"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">Title (Optional)</label>
                            <input type="text" name="title" placeholder="Auto-generated if empty" className="bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-white/50 outline-none text-white" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">Tags</label>
                            <input type="text" name="tags" placeholder="e.g. shorts, viral, 3d" className="bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-white/50 outline-none text-white" />
                        </div>

                        <button type="submit" disabled={uploading} className="bg-white text-black font-headline uppercase tracking-wider py-4 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
                            {uploading ? "Adding..." : "Add Video"}
                        </button>
                        {message && <div className="text-center text-sm">{message}</div>}
                    </form>
                </div>

                {/* --- MANAGE SECTION --- */}
                <div className="border border-white/20 p-8 rounded-2xl bg-white/5 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-headline uppercase text-center">Manage Videos</h2>
                        {isDirty && (
                            <button onClick={saveOrder} className="bg-accent-gold text-black text-xs font-bold uppercase px-4 py-2 rounded hover:bg-white transition-colors animate-pulse">
                                Save Order
                            </button>
                        )}
                    </div>

                    <p className="text-xs text-white/40 mb-4 text-center">Drag items to reorder priority.</p>

                    <div className="flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? <div>Loading...</div> : items.map((item, index) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()} // Necessary for Drop to work
                                className="cursor-grab active:cursor-grabbing"
                            >
                                <AdminItem item={item} onDelete={handleDelete} onUpdate={handleUpdate} />
                            </div>
                        ))}
                        {!loading && items.length === 0 && <div className="text-white/40">No videos yet.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ... AdminItem remains mostly same, just receiving item ...
function AdminItem({ item, onDelete, onUpdate }: { item: PortfolioItem, onDelete: (id: string) => void, onUpdate: (id: string, t: string, tags: string, thumb: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [tags, setTags] = useState(item.tags.join(", "));
    const [thumb, setThumb] = useState(item.thumbnailSrc || "");

    // Derive Thumbnail Logic (Shared with PortfolioGrid approx)
    let displayThumb = thumb;
    if (!displayThumb) {
        const id = item.youtubeId;
        if (id) {
            displayThumb = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
        } else if (item.videoSrc && (item.videoSrc.includes("youtube") || item.videoSrc.includes("youtu.be"))) {
            const match = item.videoSrc.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
            const extractedId = (match && match[2].length === 11) ? match[2] : null;
            displayThumb = extractedId ? `https://img.youtube.com/vi/${extractedId}/mqdefault.jpg` : "https://placehold.co/100x100?text=?";
        } else {
            displayThumb = "https://placehold.co/100x100?text=?";
        }
    }

    // Actual ID for display
    const currentId = item.youtubeId || (() => {
        const match = item.videoSrc?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        return (match && match[2].length === 11) ? match[2] : null;
    })();

    return (
        <div className="bg-black/40 border border-white/10 p-4 rounded-lg flex gap-4 items-center group relative overflow-hidden transition-colors hover:bg-white/5">
            <div className="flex flex-col justify-center self-center text-white/20 cursor-move hover:text-white/80 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </div>

            <a href={item.videoSrc} target="_blank" rel="noopener noreferrer" className="relative group/thumb shrink-0 block w-32 h-20 rounded bg-white/10 overflow-hidden">
                <img src={displayThumb} className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold tracking-widest uppercase">
                    Open
                </div>
            </a>

            <div className="flex-grow min-w-0 flex flex-col gap-1">
                {isEditing ? (
                    <div className="flex flex-col gap-3 rounded bg-black/50 p-3 border border-white/10 relative z-20">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase tracking-widest text-white/40">Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="bg-black border border-white/20 p-2 text-sm rounded w-full text-white focus:border-white/50 outline-none" placeholder="Video Title" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase tracking-widest text-white/40">Thumbnail URL (Optional Override)</label>
                            <input value={thumb} onChange={e => setThumb(e.target.value)} className="bg-black border border-white/20 p-2 text-xs rounded w-full text-white/80 font-mono focus:border-white/50 outline-none" placeholder="https://..." />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase tracking-widest text-white/40">Tags</label>
                            <input value={tags} onChange={e => setTags(e.target.value)} className="bg-black border border-white/20 p-2 text-xs rounded w-full text-white/80 focus:border-white/50 outline-none" placeholder="tag1, tag2" />
                        </div>
                        <div className="flex gap-2 mt-2 justify-end">
                            <button onClick={() => setIsEditing(false)} className="bg-white/5 text-white/60 px-3 py-1.5 text-xs rounded uppercase hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={() => { onUpdate(item.id, title, tags, thumb); setIsEditing(false); }} className="bg-green-600 text-white px-3 py-1.5 text-xs rounded uppercase hover:bg-green-500 transition-colors font-bold shadow-lg shadow-green-900/20">Save</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <h3 className="font-headline text-lg truncate text-white leading-tight">{item.title}</h3>
                            {currentId && <span className="text-[9px] font-mono text-white/20 bg-white/5 px-1.5 py-0.5 rounded tracking-wide border border-white/5">{currentId}</span>}
                        </div>
                        <div className="flex gap-1 flex-wrap mt-1">
                            {item.tags.map(tag => (
                                <span key={tag} className="text-[9px] uppercase tracking-widest bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-white/50">
                                    {tag}
                                </span>
                            ))}
                            {item.tags.length === 0 && <span className="text-[9px] text-white/20 uppercase italic">No tags</span>}
                        </div>
                    </>
                )}
            </div>

            <div className="flex flex-col gap-1 shrink-0 border-l border-white/5 pl-4 ml-2">
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="group/btn flex items-center gap-2 text-xs text-white/40 hover:text-white uppercase transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.5L16.862 4.487" />
                        </svg>
                        Edit
                    </button>
                )}
                <button onClick={() => onDelete(item.id)} className="group/btn flex items-center gap-2 text-xs text-red-500/40 hover:text-red-500 uppercase transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    );
}
