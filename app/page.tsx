"use client";

import { useState } from "react";
import { Download, Link as LinkIcon, Loader2, PlayCircle, AlertCircle } from "lucide-react";
import { ViewCounter } from "@/components/ViewCounter";
// Image is intentionally unused if valid next/image replacement is tricky with external urls without configuration
// We will use standard img for simplicity with external CDN URLs to avoid config issues
// But to fix lint, we suppress or config it. For now, let's just use standard img and ignore loop warning as it is an external URL.

type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

type MediaData = {
  title: string;
  description: string;
  media: MediaItem[];
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MediaData | null>(null);
  const [error, setError] = useState("");

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch data");
      }

      if (json.data && json.data.media && json.data.media.length > 0) {
        setData(json.data);
      } else {
        setError("No media found in this post. Make sure it's a public post.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadMedia = (mediaUrl: string, type: 'video' | 'image', title: string, index: number) => {
    const safeTitle = title.slice(0, 30).replace(/[^a-z0-9]/gi, '_') || 'linkedin-media';
    // We add download=true to force the browser to verify content-disposition
    const filename = `${safeTitle}_${index + 1}`;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(mediaUrl)}&filename=${filename}&download=true`;
    window.location.href = proxyUrl;
  };

  const downloadAll = async () => {
    if (!data || !data.media.length) return;

    const button = document.getElementById('download-all-btn') as HTMLButtonElement;
    const oldText = button.innerText;
    button.innerText = "Zipping...";
    button.disabled = true;

    try {
        const title = data.title.slice(0, 30).replace(/[^a-z0-9]/gi, '_') || 'linkedin-post';
        const files = data.media.map((m, i) => {
            let ext = m.type === 'video' ? 'mp4' : 'jpg';
            if (m.url.includes('.png')) ext = 'png';

            return {
                url: m.url,
                name: `${title}_${i + 1}.${ext}`
            };
        });

        const response = await fetch('/api/zip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files })
        });

        if (!response.ok) throw new Error("Zip failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}_media.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

    } catch {
        alert("Failed to create zip file");
    } finally {
        button.innerText = oldText;
        button.disabled = false;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-500/30">

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
               <Download className="w-5 h-5 text-white" />
             </div>
             <h1 className="font-bold text-xl tracking-tight">LinkedSaver</h1>
          </div>
          <ViewCounter />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-12 px-6 gap-10 pb-20">

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Download LinkedIn Videos & Images
          </h2>
          <p className="text-zinc-400 text-lg">
            Paste a LinkedIn post link below to extract and download high-quality media instantly.
          </p>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-xl relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <form onSubmit={handleExtract} className="relative flex items-center bg-zinc-900 rounded-xl border border-zinc-800 p-2 shadow-2xl">
            <div className="pl-4 pr-3 text-zinc-500">
              <LinkIcon className="w-5 h-5" />
            </div>
            <input
              type="url"
              placeholder="Paste LinkedIn URL here..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 h-10 w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 h-10 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing</span>
                </>
              ) : (
                "Extract"
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20 max-w-xl w-full">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Post Info */}
            <div className="text-center space-y-4">
                 <div className="space-y-2">
                    <h3 className="font-semibold text-xl text-zinc-100">
                        {data.title || "LinkedIn Post"}
                    </h3>
                    {data.description && (
                        <p className="text-sm text-zinc-400 max-w-2xl mx-auto line-clamp-3">
                        {data.description}
                        </p>
                    )}
                 </div>

                 <div className="flex items-center justify-center gap-4">
                    <p className="text-xs text-blue-400 font-mono">
                        Found {data.media?.length || 0} media items
                    </p>
                    {data.media && data.media.length > 1 && (
                        <button
                            id="download-all-btn"
                            onClick={downloadAll}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 font-medium"
                        >
                            <Download className="w-3 h-3" />
                            Download All (ZIP)
                        </button>
                    )}
                 </div>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data.media || []).map((item, index) => (
                <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                  {/* Media Preview */}
                  <div className="aspect-video relative bg-zinc-950 flex items-center justify-center border-b border-zinc-800">
                    {item.type === 'video' ? (
                       <video
                         src={item.url}
                         controls
                         className="w-full h-full object-contain"
                       />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/proxy?url=${encodeURIComponent(item.url)}`}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex items-center justify-between gap-4 bg-zinc-900">
                    <div className="text-sm text-zinc-400 font-medium">
                        {item.type === 'video' ? 'Video' : 'Image'} {index + 1}
                    </div>
                    <button
                      onClick={() => downloadMedia(item.url, item.type, data.title, index)}
                      className="flex-1 max-w-[160px] bg-white text-black hover:bg-zinc-200 h-10 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-sm cursor-pointer"
                    >
                      {item.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-zinc-600 text-sm">
        <p>&copy; {new Date().getFullYear()} LinkedSaver. Built for demo purposes.</p>
      </footer>
    </div>
  );
}
