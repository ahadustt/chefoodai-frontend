// Home page with AI-powered recipe discovery
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Users, 
  ArrowRight,
  ChefHat,
  Star
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { SearchBar } from '@/components/molecules/SearchBar';
import { RecipeCard } from '@/components/molecules/RecipeCard';
import { cn } from '@/utils/cn';
import { useRecipes, useAIRecipeSuggestions } from '@/lib/react-query';
import { useUserStore } from '@/stores';
import { useDebounce } from '@/hooks/useDebounce';

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({});
  const { isAuthenticated, user } = useUserStore();
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch trending recipes
  const { 
    data: trendingRecipes, 
    isLoading: loadingTrending 
  } = useRecipes(
    { tags: ['trending'], limit: 6 },
    { enabled: !debouncedSearch }
  );

  // Fetch recipes based on search
  const { 
    data: searchResults, 
    isLoading: loadingSearch,
    fetchNextPage,
    hasNextPage 
  } = useRecipes(
    debouncedSearch ? { search: debouncedSearch, ...searchFilters } : undefined,
    { enabled: !!debouncedSearch }
  );

  // Get AI suggestions for personalized recommendations
  const { data: aiSuggestions } = useAIRecipeSuggestions(
    {
      prompt: 'Suggest recipes based on my preferences',
      context: {
        servingSize: user?.preferences?.servingSize,
        maxPrepTime: 60,
        ingredients: [],
        excludeIngredients: user?.preferences?.allergies,
      },
    },
    { enabled: isAuthenticated && !debouncedSearch }
  );

  const searchResultsFlat = useMemo(() => {
    return searchResults?.pages?.flatMap(page => page.data || []) || [];
  }, [searchResults]);

  const trendingRecipesData = trendingRecipes?.pages?.[0]?.data || [];
  const personalizedSuggestions = aiSuggestions?.data?.recipes || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-16 pt-8">
        <div className="container-responsive">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <ChefHat className="h-8 w-8 text-primary-600" />
            </div>
            
            <h1 className="text-display-1 mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Discover Amazing Recipes with AI
            </h1>
            
            <p className="text-body-large mx-auto mb-8 max-w-2xl text-gray-600">
              Get personalized recipe recommendations, create meal plans, and explore 
              cuisines from around the world. Powered by artificial intelligence.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mb-8 max-w-4xl">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onFiltersChange={setSearchFilters}
                placeholder="Search for recipes, ingredients, or cuisines..."
                showAISuggestions={true}
                className="w-full"
              />
            </div>

            {/* Quick Actions */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/recipes">Browse Recipes</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-responsive py-12">
        {/* Search Results */}
        {debouncedSearch && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-heading-1 mb-2">
                  Search Results for "{debouncedSearch}"
                </h2>
                <p className="text-gray-600">
                  {searchResultsFlat.length} recipes found
                </p>
              </div>
            </div>

            {loadingSearch ? (
              <div className="grid-responsive">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card p-4">
                    <div className="skeleton aspect-card mb-4" />
                    <div className="skeleton-title mb-2" />
                    <div className="skeleton-text mb-4" />
                    <div className="flex gap-2">
                      <div className="skeleton h-4 w-16" />
                      <div className="skeleton h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResultsFlat.length > 0 ? (
              <>
                <div className="grid-responsive mb-8">
                  {searchResultsFlat.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
                
                {hasNextPage && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={loadingSearch}
                    >
                      Load More Results
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Personalized Recommendations */}
        {!debouncedSearch && isAuthenticated && personalizedSuggestions.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <h2 className="text-heading-1">Recommended for You</h2>
            </div>
            
            <div className="grid-responsive mb-6">
              {personalizedSuggestions.slice(0, 6).map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link to="/recommendations">
                  View All Recommendations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Trending Recipes */}
        {!debouncedSearch && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-red-500" />
                <h2 className="text-heading-1">Trending This Week</h2>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/trending">View All</Link>
              </Button>
            </div>

            {loadingTrending ? (
              <div className="grid-responsive">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card p-4">
                    <div className="skeleton aspect-card mb-4" />
                    <div className="skeleton-title mb-2" />
                    <div className="skeleton-text mb-4" />
                    <div className="flex gap-2">
                      <div className="skeleton h-4 w-16" />
                      <div className="skeleton h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid-responsive">
                {trendingRecipesData.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Feature Highlights */}
        {!debouncedSearch && (
          <section className="mb-16">
            <h2 className="text-heading-1 mb-8 text-center">
              Why Choose ChefoodAI™?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <Sparkles className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI-Powered Recommendations
                </h3>
                <p className="text-gray-600">
                  Get personalized recipe suggestions based on your preferences, 
                  dietary restrictions, and cooking history.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100">
                  <Clock className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Smart Meal Planning
                </h3>
                <p className="text-gray-600">
                  Create weekly meal plans automatically with balanced nutrition 
                  and shopping lists generated for you.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Community Driven
                </h3>
                <p className="text-gray-600">
                  Share your creations, rate recipes, and discover what the 
                  community is cooking.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!debouncedSearch && !isAuthenticated && (
          <section className="rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 p-8 text-center text-white">
            <h2 className="text-heading-1 mb-4">
              Ready to Transform Your Cooking?
            </h2>
            <p className="text-body-large mb-6 opacity-90">
              Join thousands of home cooks who have discovered their new favorite recipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/register">
                  Start Cooking Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};