"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CategoryItem {
  name: string;
  description: string;
  image: string;
}

export function CategoryScrollGallery({ items }: { items: CategoryItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  useEffect(() => {
    const measure = () => setTravel(Math.max(0, (trackRef.current?.scrollWidth ?? 0) - (viewportRef.current?.clientWidth ?? 0)));
    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (trackRef.current) observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <section className="category-scroll" ref={sectionRef}>
      <div className="category-scroll__sticky">
        <div className="shell">
          <div className="section-heading section-heading--dark">
            <div><p className="eyebrow">Danh mục xe</p><h2>Khám phá theo phong cách sống.</h2></div>
            <Link href="/cars">Xem tất cả danh mục <ArrowRight size={16} /></Link>
          </div>
          <div className="category-scroll__viewport" ref={viewportRef}>
            <motion.div className="category-scroll__track" ref={trackRef} style={{ x }}>
              {items.map((item) => (
                <Link href={`/cars?body=${item.name}`} key={item.name} className="category-card">
                  <Image src={item.image} alt={`Danh mục xe ${item.name}`} fill sizes="(max-width: 760px) 78vw, 25vw" />
                  <span><strong>{item.name === "Electric" ? "Xe điện" : item.name === "Luxury" ? "Hạng sang" : item.name}</strong><small>{item.description}</small></span>
                </Link>
              ))}
            </motion.div>
          </div>
          <div className="category-scroll__hint"><span>Cuộn để xem thêm</span><i /></div>
        </div>
      </div>
    </section>
  );
}
