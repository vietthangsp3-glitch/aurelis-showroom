"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useState } from "react";

export function VehicleGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0] ?? "";
  const select = (index: number) => setActiveIndex((index + images.length) % images.length);
  return (
    <div className="detail-gallery">
      <div className="detail-gallery__main"><Image src={active} alt={`${name} - ảnh ${activeIndex + 1}`} fill priority sizes="(max-width: 900px) 100vw, 58vw" /><button className="detail-gallery__arrow detail-gallery__arrow--left" type="button" onClick={() => select(activeIndex - 1)} aria-label="Ảnh trước"><ChevronLeft /></button><button className="detail-gallery__arrow detail-gallery__arrow--right" type="button" onClick={() => select(activeIndex + 1)} aria-label="Ảnh tiếp theo"><ChevronRight /></button><span className="detail-gallery__expand"><Maximize2 size={16} /></span><span className="detail-gallery__counter">{activeIndex + 1} / {images.length}</span></div>
      <div className="detail-gallery__thumbs">
        {images.map((image, index) => <button type="button" className={activeIndex === index ? "is-active" : ""} key={`${image}-${index}`} onClick={() => select(index)} aria-label={`Xem ảnh ${index + 1}`}><Image src={image} alt="" fill sizes="140px" /></button>)}
      </div>
    </div>
  );
}
