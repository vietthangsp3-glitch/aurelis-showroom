"use client";

import Image from "next/image";
import { useState } from "react";

export function VehicleGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(images[0] ?? "");
  return (
    <div className="detail-gallery">
      <div className="detail-gallery__main"><Image src={active} alt={name} fill priority sizes="(max-width: 900px) 100vw, 66vw" /></div>
      <div className="detail-gallery__thumbs">
        {images.map((image, index) => <button type="button" className={active === image ? "is-active" : ""} key={image} onClick={() => setActive(image)} aria-label={`Xem ảnh ${index + 1}`}><Image src={image} alt="" fill sizes="120px" /></button>)}
      </div>
    </div>
  );
}
