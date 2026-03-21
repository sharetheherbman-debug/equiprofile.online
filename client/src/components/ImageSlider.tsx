import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  image: string;
  title?: string;
  subtitle?: string;
  caption?: string;
}

interface ImageSliderProps {
  slides: Slide[];
  /** Auto-rotate interval in ms. 0 to disable. Default 5000 */
  interval?: number;
  /** Show navigation arrows. Default true */
  showArrows?: boolean;
  /** Show dot indicators. Default true */
  showDots?: boolean;
  /** Show slide text overlay. Default true */
  showText?: boolean;
  /** CSS class for the outer container */
  className?: string;
  /** Image aspect ratio CSS (e.g. "aspect-video"). Default covers full container */
  aspectClass?: string;
  /** Overlay gradient strength */
  overlayClass?: string;
}

export function ImageSlider({
  slides,
  interval = 5000,
  showArrows = true,
  showDots = true,
  showText = true,
  className = "",
  aspectClass = "",
  overlayClass = "bg-black/40",
}: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((index + count) % count);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [count, isTransitioning],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // auto-rotate
  useEffect(() => {
    if (interval <= 0 || count <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interval, next, count]);

  if (count === 0) return null;

  return (
    <div className={`relative overflow-hidden ${aspectClass} ${className}`}>
      {/* Images */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title || slide.caption || `Slide ${i + 1}`}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className={`absolute inset-0 z-20 ${overlayClass}`} />

      {/* Text */}
      {showText && (slides[current]?.title || slides[current]?.caption) && (
        <div className="absolute inset-0 z-30 flex items-end pb-12 md:pb-16 justify-center pointer-events-none">
          <div className="text-center px-6 max-w-2xl">
            {slides[current]?.title && (
              <h2
                key={`title-${current}`}
                className="text-xl md:text-2xl font-semibold text-white mb-2 drop-shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                {slides[current].title}
              </h2>
            )}
            {slides[current]?.subtitle && (
              <p
                key={`sub-${current}`}
                className="text-sm md:text-base text-white/80 drop-shadow-md animate-in fade-in slide-in-from-bottom-1 duration-700"
              >
                {slides[current].subtitle}
              </p>
            )}
            {slides[current]?.caption && (
              <p
                key={`cap-${current}`}
                className="text-sm md:text-lg text-white/90 drop-shadow-md italic animate-in fade-in duration-700"
              >
                {slides[current].caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation arrows */}
      {showArrows && count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-5" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
