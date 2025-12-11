"use client";

import { useState, useEffect } from "react";

type PortfolioItem = {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'image';
    videoSrc?: string;
    thumbnailSrc: string;
    tags: string[];
};

export default function AdminPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch items
    const fetchItems = async () => {
        try {
            const res = await fetch(`/api/portfolio?t=${Date.now()}`);
            const data = await res.json();
            if (Array.isArray(data)) setItems(data);
        } catch (e) { console.error(e) } finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, []);

    async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setUploading(true);
        setMessage("");

        const formData = new FormData(event.currentTarget);

        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await response.json();

            if (response.ok) {
                setMessage("✅ Upload successful!");
                (event.target as HTMLFormElement).reset();
                fetchItems(); // Refresh list
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage("❌ Error: Network issue.");
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

    async function handleUpdate(id: string, newTitle: string, newTags: string) {
        const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t);
        try {
            const res = await fetch('/api/portfolio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title: newTitle, tags: tagsArray })
            });
            if (res.ok) {
                alert("Updated!");
                fetchItems();
            }
        } catch (e) { alert("Failed to update"); }
    }

    return (
        <div className="min-h-screen w-full bg-black text-white p-8 pt-24 font-body">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* --- UPLOAD SECTION --- */}
                <div className="border border-white/20 p-8 rounded-2xl bg-white/5 backdrop-blur-md h-fit">
                    <h1 className="text-3xl font-headline uppercase mb-8 text-center">New Upload</h1>

                    <form onSubmit={handleUpload} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">Video File (.mp4)</label>
                            <input type="file" name="video" accept="video/mp4" required className="bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-white/50 outline-none" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">Thumbnail (.jpg, .png)</label>
                            <input type="file" name="thumbnail" accept="image/*" className="bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-white/50 outline-none" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest text-white/60">Manual Tags</label>
                            <input type="text" name="tags" placeholder="e.g. 3d, dark, viral" className="bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-white/50 outline-none text-white" />
                        </div>

                        <button type="submit" disabled={uploading} className="bg-white text-black font-headline uppercase tracking-wider py-4 rounded hover:bg-gray-200 transition-colors disabled:opacity-50">
                            {uploading ? "Uploading..." : "Upload Video"}
                        </button>
                        {message && <div className="text-center text-sm">{message}</div>}
                    </form>
                </div>

                {/* --- MANAGE SECTION --- */}
                <div className="border border-white/20 p-8 rounded-2xl bg-white/5 backdrop-blur-md">
                    <h2 className="text-3xl font-headline uppercase mb-8 text-center">Manage Videos</h2>

                    <div className="flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? <div>Loading...</div> : items.map(item => (
                            <AdminItem key={item.id} item={item} onDelete={handleDelete} onUpdate={handleUpdate} />
                        ))}
                        {!loading && items.length === 0 && <div className="text-white/40">No videos yet.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminItem({ item, onDelete, onUpdate }: { item: PortfolioItem, onDelete: (id: string) => void, onUpdate: (id: string, t: string, tags: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [tags, setTags] = useState(item.tags.join(", "));

    return (
        <div className="bg-black/40 border border-white/10 p-4 rounded-lg flex gap-4 items-start group">
            <img src={item.thumbnailSrc} className="w-24 h-16 object-cover rounded bg-white/10 shrink-0" />

            <div className="flex-grow min-w-0">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <input value={title} onChange={e => setTitle(e.target.value)} className="bg-black/50 border border-white/20 p-1 text-sm rounded w-full" />
                        <input value={tags} onChange={e => setTags(e.target.value)} className="bg-black/50 border border-white/20 p-1 text-xs rounded w-full" />
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => { onUpdate(item.id, title, tags); setIsEditing(false); }} className="bg-green-500/20 text-green-400 px-3 py-1 text-xs rounded uppercase hover:bg-green-500/30">Save</button>
                            <button onClick={() => setIsEditing(false)} className="bg-white/10 text-white px-3 py-1 text-xs rounded uppercase hover:bg-white/20">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h3 className="font-headline text-lg truncate">{item.title}</h3>
                        <p className="text-xs text-white/50 truncate">{item.tags.join(", ")}</p>
                    </>
                )}
            </div>

            <div className="flex flex-col gap-2 shrink-0">
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-xs text-white/40 hover:text-white uppercase transition-colors">
                        Edit
                    </button>
                )}
                <button onClick={() => onDelete(item.id)} className="text-xs text-red-500/50 hover:text-red-500 uppercase transition-colors">
                    Delete
                </button>
            </div>
        </div>
    );
}
