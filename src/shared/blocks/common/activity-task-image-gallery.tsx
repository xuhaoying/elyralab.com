'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { LazyImage } from '@/shared/blocks/common/lazy-image';

type GalleryImage = {
  imageUrl?: string | null;
};

export function ActivityTaskImageGallery({
  images,
  thumbnailClassName,
}: {
  images: GalleryImage[];
  thumbnailClassName?: string;
}) {
  const validImages = images.filter(
    (image, index, array) =>
      image?.imageUrl &&
      array.findIndex((item) => item?.imageUrl === image.imageUrl) === index
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null
        ? prev === 0
          ? validImages.length - 1
          : prev - 1
        : null
    );
  }, [validImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null
        ? prev === validImages.length - 1
          ? 0
          : prev + 1
        : null
    );
  }, [validImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) {
        return;
      }
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrevious]);

  useEffect(() => {
    const className = 'showcase-preview-open';

    if (selectedIndex !== null) {
      document.body.classList.add(className);
      return () => document.body.classList.remove(className);
    }

    document.body.classList.remove(className);

    return () => document.body.classList.remove(className);
  }, [selectedIndex]);

  if (validImages.length === 0) {
    return <div>-</div>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {validImages.map((image, index) => (
          <button
            key={`${image.imageUrl}-${index}`}
            type="button"
            className="overflow-hidden rounded-md border border-border bg-muted"
            onClick={() => setSelectedIndex(index)}
          >
            <LazyImage
              src={image.imageUrl!}
              alt="Generated image"
              className={
                thumbnailClassName ||
                'h-[50px] w-[50px] cursor-zoom-in object-cover'
              }
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 z-50 text-white/70 transition-colors hover:text-white"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="size-8" />
            </button>

            {validImages.length > 1 && (
              <button
                type="button"
                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/70 transition-colors hover:bg-black/40 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
              >
                <ChevronLeft className="size-8 md:size-12" />
              </button>
            )}

            {validImages.length > 1 && (
              <button
                type="button"
                className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/70 transition-colors hover:bg-black/40 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <ChevronRight className="size-8 md:size-12" />
              </button>
            )}

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-full w-full items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-h-full max-w-full overflow-hidden rounded-lg">
                <LazyImage
                  src={validImages[selectedIndex].imageUrl!}
                  alt="Generated image preview"
                  className="h-auto max-h-[90vh] w-auto max-w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
