import React, { useState, useRef, useCallback } from 'react';
import { ChefHat, RefreshCw } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  fallbackText?: string;
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  title,
  className = "",
  fallbackText = "Recipe Image",
  fallbackSrc
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const maxRetries = 2;

  const handleImageLoad = useCallback(() => {
    setImageState('loaded');
  }, []);

  const handleImageError = useCallback(() => {
    console.log(`🖼️ Image failed to load for recipe: ${title || alt}`);
    
    // Try a fallback image if this is the first failure
    if (retryCount === 0 && !src.includes('picsum.photos')) {
      // Use provided fallbackSrc or generate one based on recipe title
      const fallbackUrl = fallbackSrc || `https://picsum.photos/seed/${btoa(title || alt || 'recipe').substring(0, 8)}/800/600`;
      
      if (imgRef.current) {
        setRetryCount(1);
        setImageState('loading');
        imgRef.current.src = fallbackUrl;
        return;
      }
    }
    
    setImageState('error');
  }, [title, alt, retryCount, src, fallbackSrc]);

  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries && imgRef.current) {
      setRetryCount(prev => prev + 1);
      setImageState('loading');
      // Force reload by adding a timestamp parameter
      const newSrc = src + (src.includes('?') ? '&' : '?') + `retry=${Date.now()}`;
      imgRef.current.src = newSrc;
    }
  }, [src, retryCount, maxRetries]);

  // Check if the URL is a temporary Azure blob URL that might be expired
  const isTemporaryUrl = src.includes('oaidalleapiprodscus.blob.core.windows.net');
  
  return (
    <div className="relative w-full h-full">
      {imageState !== 'error' && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={className}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            display: imageState === 'loaded' ? 'block' : 'none'
          }}
        />
      )}
      
      {/* Loading state */}
      {imageState === 'loading' && (
        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-spin" />
            <span className="text-emerald-600 text-sm">Loading image...</span>
          </div>
        </div>
      )}

      {/* Error state with fallback */}
      {imageState === 'error' && (
        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
          <div className="text-center p-4">
            <ChefHat className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <span className="text-emerald-700 text-sm font-medium block mb-2">{fallbackText}</span>
            
            {isTemporaryUrl && (
              <span className="text-emerald-500 text-xs block mb-3">
                Image temporarily unavailable
              </span>
            )}
            
            {retryCount < maxRetries && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs rounded-full hover:bg-emerald-600 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry ({retryCount + 1}/{maxRetries + 1})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback; 