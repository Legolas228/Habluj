import React, { useState, useEffect, useRef } from 'react';

export default function Carousel({ images = [], delay = 3000, className = '', priority = false }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);
  const carouselLabelId = React.useId();

  useEffect(() => {
    if (!images || images.length === 0) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, delay);

    return () => clearInterval(timerRef.current);
  }, [images, delay]);

  if (!images || images.length === 0) {
    return <div className="w-full h-full bg-gray-300 flex items-center justify-center"><p>Sin imágenes</p></div>;
  }

  const current = images[index];

  const handleKeyDown = (event) => {
    if (!images?.length) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setIndex((i) => (i + 1) % images.length);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setIndex((i) => (i - 1 + images.length) % images.length);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setIndex(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      setIndex(images.length - 1);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={carouselLabelId}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <p id={carouselLabelId} className="sr-only">
        Monument image carousel
      </p>
      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {images.length}: {current.alt}
      </p>
      {/* Image with fade transition */}
      <img
        src={current.src}
        alt={current.alt || `monument-${index}`}
        className="w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: fade ? 1 : 0 }}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-40"></div>

      {/* Location label - top right corner */}
      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-20">
        <p className="text-sm font-semibold text-gray-900">{current.alt}</p>
      </div>

      {/* indicators */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 flex gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all rounded-full ${i === index ? 'w-8 h-3 bg-white' : 'w-3 h-3 bg-white/50 hover:bg-white/75'
              }`}
            aria-label={`Go to slide ${i + 1} of ${images.length}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
