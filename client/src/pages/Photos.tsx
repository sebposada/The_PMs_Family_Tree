import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/Navigation";
import { RouteGuard } from "@/components/RouteGuard";
import { trpc } from "@/lib/trpc";
import { Search, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function PhotosContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: allPhotos, isLoading: allLoading } = trpc.media.getAll.useQuery(undefined, {
    enabled: !searchQuery.trim(),
  });

  const { data: searchResults, isLoading: searchLoading } = trpc.media.search.useQuery(
    { query: searchQuery },
    { enabled: !!searchQuery.trim() }
  );

  const photos = searchQuery.trim() ? searchResults : allPhotos;
  const isLoading = searchQuery.trim() ? searchLoading : allLoading;

  const photoSlides = photos?.map((p) => ({ src: p.url })) || [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <header className="border-b border-[#3D5A40]/10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif font-bold text-[#2C3E3C]">Photo Archive</h1>
          <p className="text-[#5A6B5F] mt-1">Browse all family photos</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5A6B5F] w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by caption or tagged people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#3D5A40]/20 focus:border-[#3D5A40] bg-white"
            />
          </div>
        </div>

        {/* Photo Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-[#5A6B5F]">Loading photos...</div>
        ) : !photos || photos.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto text-[#5A6B5F] mb-4" />
            <p className="text-[#5A6B5F] text-lg">
              {searchQuery ? "No photos found matching your search" : "No photos in the archive yet"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[#5A6B5F] mb-4">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="polaroid-card cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => openLightbox(idx)}
                >
                  <div className="aspect-square bg-[#F5F5F0] rounded-lg overflow-hidden">
                    <img src={photo.url} alt={photo.caption || ""} className="w-full h-full object-cover" />
                  </div>
                  {photo.caption && (
                    <p className="text-sm text-[#5A6B5F] mt-2 px-2 line-clamp-2">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Lightbox */}
      <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={photoSlides} index={lightboxIndex} />
    </div>
    </>
  );
}

export default function Photos() {
  return (
    <RouteGuard requireAuth requireApproval>
      <PhotosContent />
    </RouteGuard>
  );
}
