import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselSize = "sm" | "lg";

export interface CarouselItem {
  id: string;
  content: ReactNode;
  ariaLabel?: string;
}

export interface CarouselProps {
  items: CarouselItem[];
  size?: CarouselSize;
  ariaLabel?: string;
  defaultIndex?: number;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  onIndexChange?: (index: number) => void;
}

const sizeClass: Record<CarouselSize, string> = {
  sm: "h-[120px]",
  lg: "h-[176px]",
};

function clampIndex(index: number, itemCount: number) {
  return Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0));
}

export function Carousel({
  items,
  size = "lg",
  ariaLabel = "轮播内容",
  defaultIndex = 0,
  autoPlay = false,
  interval = 5000,
  className = "",
  onIndexChange,
}: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const carouselId = useId();
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(defaultIndex, items.length));
  const [paused, setPaused] = useState(false);

  const select = useCallback((index: number, announce = true) => {
    const nextIndex = clampIndex(index, items.length);
    const viewport = viewportRef.current;
    if (viewport) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      viewport.scrollTo({ left: nextIndex * viewport.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    }
    setActiveIndex(current => {
      if (current !== nextIndex && announce) onIndexChange?.(nextIndex);
      return nextIndex;
    });
  }, [items.length, onIndexChange]);

  useEffect(() => {
    const nextIndex = clampIndex(activeIndex, items.length);
    if (nextIndex !== activeIndex) select(nextIndex);
  }, [activeIndex, items.length, select]);

  useEffect(() => {
    if (!autoPlay || paused || items.length < 2) return;
    const timer = window.setInterval(() => select((activeIndex + 1) % items.length, false), Math.max(interval, 2000));
    return () => window.clearInterval(timer);
  }, [activeIndex, autoPlay, interval, items.length, paused, select]);

  const syncIndexFromScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport?.clientWidth) return;
    const nextIndex = clampIndex(Math.round(viewport.scrollLeft / viewport.clientWidth), items.length);
    setActiveIndex(current => {
      if (current !== nextIndex) onIndexChange?.(nextIndex);
      return nextIndex;
    });
  };

  if (items.length === 0) return null;

  return (
    <section
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={event => {
        if (event.key === "ArrowLeft") { event.preventDefault(); select(activeIndex - 1); }
        if (event.key === "ArrowRight") { event.preventDefault(); select(activeIndex + 1); }
      }}
    >
      <div
        ref={viewportRef}
        id={carouselId}
        className={`flex w-full snap-x snap-mandatory overflow-x-auto rounded-container [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${sizeClass[size]}`}
        onScroll={syncIndexFromScroll}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="h-full min-w-full snap-center overflow-hidden"
            role="group"
            aria-roledescription="slide"
            aria-label={item.ariaLabel ?? `${index + 1} / ${items.length}`}
          >
            {item.content}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button type="button" className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition active:bg-black/55 disabled:opacity-35" aria-label="上一张" aria-controls={carouselId} disabled={activeIndex === 0} onClick={() => select(activeIndex - 1)}><ChevronLeft size={18} aria-hidden="true" /></button>
          <button type="button" className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition active:bg-black/55 disabled:opacity-35" aria-label="下一张" aria-controls={carouselId} disabled={activeIndex === items.length - 1} onClick={() => select(activeIndex + 1)}><ChevronRight size={18} aria-hidden="true" /></button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5" aria-label={`第 ${activeIndex + 1} 张，共 ${items.length} 张`}>
            {items.map((item, index) => <button key={item.id} type="button" className={`h-2 rounded-full shadow-sm transition-[width,background-color] ${index === activeIndex ? "w-4 bg-white" : "w-2 bg-white/55"}`} aria-label={`转到第 ${index + 1} 张`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => select(index)} />)}
          </div>
        </>
      )}
    </section>
  );
}
