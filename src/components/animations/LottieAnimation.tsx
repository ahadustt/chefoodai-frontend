import React from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  animationData?: any;
  animationUrl?: string;
  className?: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  animationUrl,
  className = '',
  width,
  height,
  loop = true,
  autoplay = true,
}) => {
  const [animation, setAnimation] = React.useState(animationData);

  React.useEffect(() => {
    if (animationUrl && !animationData) {
      // Fetch animation from URL (encode spaces and special characters)
      const encodedUrl = encodeURI(animationUrl);
      fetch(encodedUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load animation: ${response.status}`);
          }
          return response.json();
        })
        .then(data => setAnimation(data))
        .catch(error => {
          console.error('Failed to load Lottie animation:', error);
          // Keep animation as null to show fallback
        });
    }
  }, [animationUrl, animationData]);

  if (!animation) {
    return (
      <div 
        className={`animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg ${className}`}
        style={{ width: width || 64, height: height || 64 }}
      />
    );
  }

  return (
    <Lottie
      animationData={animation}
      className={className}
      style={{ width, height }}
      loop={loop}
      autoplay={autoplay}
    />
  );
}; 