import { useEffect, useState } from "react";
import SoftBackdrop from "../components/SoftBackdrop";
import { type IThumbnail } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";import { ArrowUpRightIcon, DownloadIcon, TrashIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import toast from "react-hot-toast";

const MyGeneration = () => {

  const {isLoggedIn} = useAuth();

  const navigate = useNavigate();

  const aspectRatioClassMap : Record<string, string> = {
        "16:9": "aspect-video",
        "9:16": "aspect-[9/16]",
        "1:1": "aspect-square"
  }

  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchThumbnails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/user/thumbnails/');
      setThumbnails(data.thumbnails || []);
    } catch (error : any) {
      console.error("Error fetching thumbnails:", error);
      toast.error(error?.response?.data?.message || "Failed to load thumbnails.");
    }
    finally {
      setLoading(false);
    }
  };

  const handleDownload = (image_url: string) => {
    const link = document.createElement('a');
        link.href = image_url.replace('/upload', '/upload/fl_attachment');
        document.body.appendChild(link);
        link.click();
        link.remove();
  };

  const handleDelete = async (id: string) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this thumbnail?");
      if (!confirm) return;
      const {data} = await api.delete(`/api/thumbnail/delete/${id}`);
      toast.success(data.message || "Thumbnail deleted successfully.");
      setThumbnails(thumbnails.filter((thumb) => thumb._id !== id));
     } catch (error : any) {
       toast.error(error?.response?.data?.message || "Failed to delete thumbnail.");
     }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchThumbnails();
    }
  }, [isLoggedIn]);

  return (
    <>
      <SoftBackdrop />
      <div className="mt-32 min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-200">My Generations</h1>
          <p className="text-sm text-zinc-400 mt-1">
            View and manage your AI-generated thumbnails
          </p>
        </div>

        
        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl h-[260px]"
              >
                {/* shimmer layer */}
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />

                {/* soft glow */}
                <div
                  className=" absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state*/}
        {!loading && thumbnails.length === 0 && (
          <div className="py-24 text-center">
            <h3 className="text-lg font-semibold text-zinc-200">No generations found. Start creating your thumbnails!</h3>
          </div>
        )}

        {/* THUMBNAILS GRID */}
        {!loading && thumbnails.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-8">
            {thumbnails.map((thumb: IThumbnail) => {
              const aspectClass = aspectRatioClassMap[thumb.aspect_ratio || "16:9"] || "aspect-video";
              return (
                <div key={thumb._id} onClick={() => navigate(`/generate/${thumb._id}`)} className="mb-8 group relative cursor-pointer break-inside-avoid rounded-2xl border border-white/10 transition shadow-xl bg-white/6"> 
                  {/* IMAGE */}
                  <div className={`relative overflow-hidden rounded-t-2xl ${aspectClass} bg-black`}>
                         {thumb.image_url ? (
                          <img src={thumb.image_url} alt={thumb.title || "Generated Thumbnail"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-zinc-400">
                           {thumb.isGenerating ? 'Generating...' : 'No Image'}
                          </div>
                    )}
                    
                    {thumb.isGenerating && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm font-medium text-white">
                       Generating...
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-zinc-100 font-semibold text-sm line-clamp-2">{thumb.title || "Untitled"}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-white/8">{thumb.style}</span>
                      <span className="px-2 py-0.5 rounded bg-white/8">{thumb.color_scheme}</span>
                      <span className="px-2 py-0.5 rounded bg-white/8">{thumb.aspect_ratio}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{new Date(thumb.createdAt!).toLocaleDateString()}</p>
                  </div>

                  <div onClick={(e)=>e.stopPropagation()} className="absolute bottom-2 right-2 flex gap-1.5 max-sm:flex sm:hidden group-hover:flex">
                    <TrashIcon onClick={()=> handleDelete(thumb._id)} className="size-8 bg-black/50 p-1 rounded hover:bg-pink-600 transition-all" />
                    <DownloadIcon onClick={() => handleDownload(thumb.image_url!)} className="size-8 bg-black/50 p-1 rounded hover:bg-green-600 transition-all" />
                    <Link to={`/preview?thumbnail_url=${thumb.image_url}&title=${thumb.title}`} target="_blank" rel="noopener noreferrer"> 
                      <ArrowUpRightIcon className="size-8 bg-black/50 p-1 rounded hover:bg-blue-600 transition-all" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </>
  );
};

export default MyGeneration;
