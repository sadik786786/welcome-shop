"use client";

import { useState } from "react";
import Image from "next/image";
import { PackageOpen } from "lucide-react";

export default function ProductGallery({ images, productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center text-slate-400">
          <PackageOpen className="mx-auto h-16 w-16" />
          <p className="mt-2 text-sm">No image available</p>
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Image
          src={selectedImage.image_url}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                selectedIndex === index
                  ? "border-blue-600 ring-2 ring-blue-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.image_url}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}