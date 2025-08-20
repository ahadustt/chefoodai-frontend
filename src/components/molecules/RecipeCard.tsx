// Recipe card component with optimized loading and interactions
// Recipe card component with optimized loading and interactions
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Users, Star, Zap } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/utils/cn';
import { useRecipeStore } from '@/stores';
import { useToggleFavorite } from '@/lib/react-query';
import type { Recipe } from '@/types';
import ImageWithFallback from '@/components/ImageWithFallback';

interface RecipeCardProps {
  recipe: Recipe;
  showFavoriteButton?: boolean;
  compact?: boolean;
  className?: string;
  onCardClick?: (recipe: Recipe) => void;
}

export const RecipeCard = memo<RecipeCardProps>(({
  recipe,
  showFavoriteButton = true,
  compact = false,
  className,
  onCardClick,
}) => {
  const { favoriteRecipes, toggleFavorite, addToRecent } = useRecipeStore();
  const isFavorite = favoriteRecipes.includes(recipe.id);
  
  const toggleFavoriteMutation = useToggleFavorite({
    onSuccess: () => {
      toggleFavorite(recipe.id);
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate({
      recipeId: recipe.id,
      isFavorite: !isFavorite,
    });
  };

  const handleCardClick = () => {
    addToRecent(recipe);
    onCardClick?.(recipe);
  };

  const cardContent = (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2',
        compact ? 'flex space-x-3' : 'flex flex-col',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className={cn(
        'relative overflow-hidden bg-gray-100',
        compact ? 'h-20 w-20 flex-shrink-0 rounded-md' : 'aspect-[4/3] w-full'
      )}>
        {recipe.imageUrl ? (
          <ImageWithFallback
            src={recipe.imageUrl}
            alt={recipe.title}
            title={recipe.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            fallbackText="Recipe Image"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        
        {/* Favorite button */}
        {showFavoriteButton && !compact && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={handleFavoriteClick}
            ariaLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        'flex flex-1 flex-col',
        compact ? 'py-1' : 'p-4'
      )}>
        <div className={cn(
          'flex-1',
          compact && 'space-y-1'
        )}>
          <h3 className={cn(
            'font-semibold text-gray-900 line-clamp-2',
            compact ? 'text-sm' : 'text-base'
          )}>
            {recipe.title}
          </h3>
          
          {!compact && recipe.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Meta information */}
        <div className={cn(
          'flex items-center gap-3 text-xs text-gray-500',
          compact ? 'mt-1' : 'mt-3'
        )}>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{recipe.prepTime + recipe.cookTime}m</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden="true" />
            <span>{recipe.servings}</span>
          </div>
          
          {recipe.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span>{recipe.rating.toFixed(1)}</span>
            </div>
          )}
          
          {recipe.nutrition?.calories && recipe.nutrition.calories > 0 && (
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" aria-hidden="true" />
              <span>{recipe.nutrition.calories} cal</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {!compact && recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Favorite button for compact mode */}
        {showFavoriteButton && compact && (
          <Button
            variant="ghost"
            size="xs"
            className="mt-2 self-start"
            onClick={handleFavoriteClick}
            ariaLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart
              className={cn(
                'h-3 w-3',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </Button>
        )}
      </div>
    </article>
  );

  // Wrap with Link if we have a recipe ID
  if (recipe.id && !onCardClick) {
    return (
      <Link
        to={`/recipes/${recipe.id}`}
        className="block focus:outline-none"
        aria-label={`View recipe: ${recipe.title}`}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
});

RecipeCard.displayName = 'RecipeCard';