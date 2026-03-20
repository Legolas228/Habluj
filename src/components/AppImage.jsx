import React, { useState, useEffect } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  sizes = "100vw",
  priority = false,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setIsLoading(false);
    };
  }, [src]);

  // Generar srcset para diferentes tamaños
  const generateSrcSet = () => {
    if (!src || src.includes('?')) return undefined;
    const widths = [640, 750, 828, 1080, 1200];
    const separator = src.includes('?') ? '&' : '?';
    return widths
      .map((w) => `${src}${separator}w=${w} ${w}w`)
      .join(", ");
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={currentSrc}
        srcSet={!priority ? generateSrcSet() : undefined}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={`${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
        onError={(e) => {
          setCurrentSrc("/assets/images/no_image.png");
          setIsLoading(false);
        }}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
      )}
    </div>
  );
}

export default Image;

