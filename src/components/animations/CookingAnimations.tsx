// Cooking-related Lottie animations from Creattie
// To use with animations from https://creattie.com/lottie-animated-illustrations/all

export const COOKING_ANIMATIONS = {
  // Hero Section Benefits
  LIGHTNING_FAST: {
    url: '/animations/Creative Spark.json',
    fallback: '⚡',
    description: 'Lightning fast recipe generation'
  },
  
  TARGET_PRECISION: {
    url: '/animations/Target.json',
    fallback: '🎯',
    description: '100% personalized recipes'
  },
  
  INFINITE_CREATIVITY: {
    url: '/animations/Cooking.json',
    fallback: '🍳',
    description: 'Infinite cooking creativity'
  },

  // Features Section
  MAGIC_SPARKLES: {
    url: '/animations/Sparklers.json', 
    fallback: '✨',
    description: 'AI magic animation'
  },
  
  COOKING_TIMER: {
    url: '/animations/Time.json',
    fallback: '⏱️', 
    description: 'Quick timing animation'
  },
  
  CHEF_HEART: {
    url: '/animations/Heart Healing.json',
    fallback: '❤️',
    description: 'Personalized cooking love'
  },

  // Brand/Navigation
  CHEF_HAT_ANIMATED: {
    url: '/animations/Chef.json',
    fallback: '👨‍🍳',
    description: 'Animated chef hat for branding'
  },

  // Loading States  
  COOKING_LOADER: {
    url: '/animations/Cooking.json',
    fallback: '🔄',
    description: 'Cooking process loader'
  },

  // Meal Planning
  PREPARING_FOOD: {
    url: '/animations/Preparing Food.json',
    fallback: '🍽️',
    description: 'Preparing food for meal planning'
  }
};

// Helper component for easy animation usage
import React from 'react';
import { LottieAnimation } from './LottieAnimation';

interface CookingAnimationProps {
  type: keyof typeof COOKING_ANIMATIONS;
  width?: number;
  height?: number;
  className?: string;
  showFallback?: boolean;
}

export const CookingAnimation: React.FC<CookingAnimationProps> = ({
  type,
  width = 64,
  height = 64,
  className = '',
  showFallback = false
}) => {
  const animation = COOKING_ANIMATIONS[type];
  
  if (showFallback) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-8xl animate-pulse">{animation.fallback}</span>
      </div>
    );
  }

  return (
    <LottieAnimation
      animationUrl={animation.url}
      width={width}
      height={height}
      className={className}
      loop={true}
      autoplay={true}
    />
  );
}; 