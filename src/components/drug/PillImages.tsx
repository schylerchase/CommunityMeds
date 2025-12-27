import { useState, useEffect } from 'react';
import { getPillImages, type DrugImage } from '../../services/drugImages';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PillImagesProps {
  drugName: string;
  ndcCodes?: string[];
}

export function PillImages({ drugName, ndcCodes }: PillImagesProps) {
  const [images, setImages] = useState<DrugImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<DrugImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      // Try with NDC first, then drug name
      let imgs: DrugImage[] = [];

      if (ndcCodes && ndcCodes.length > 0) {
        imgs = await getPillImages(drugName, ndcCodes[0]);
      }

      if (imgs.length === 0) {
        imgs = await getPillImages(drugName);
      }

      setImages(imgs);
      setLoading(false);
    };

    fetchImages();
  }, [drugName, ndcCodes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-sm text-gray-500">Loading pill images...</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">No pill images available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src={img.url}
              alt={`${img.name} pill`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="w-full"
            />
            <div className="p-4 bg-white">
              <p className="font-medium text-gray-900">{selectedImage.name}</p>
              {selectedImage.ndc && (
                <p className="text-sm text-gray-500">NDC: {selectedImage.ndc}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2 text-center">
        Images from NIH RxImage. Appearance may vary by manufacturer.
      </p>
    </div>
  );
}
