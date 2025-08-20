// Advanced search bar with filters and AI suggestions
import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';
import { useAIRecipeSuggestions } from '@/lib/react-query';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  placeholder?: string;
  showAISuggestions?: boolean;
  showFilters?: boolean;
  className?: string;
}

interface SearchFilters {
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  dietaryRestrictions?: string[];
}

export const SearchBar = ({
  value,
  onChange,
  onFiltersChange,
  placeholder = 'Search recipes...',
  showAISuggestions = true,
  showFilters = true,
  className,
}: SearchBarProps) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearch = useDebounce(value, 300);
  
  // AI suggestions query
  const { data: aiSuggestions, isLoading: isLoadingSuggestions } = useAIRecipeSuggestions(
    {
      prompt: debouncedSearch,
      context: {
        maxPrepTime: filters.maxPrepTime,
      },
    },
    {
      enabled: showAISuggestions && debouncedSearch.length > 2,
    }
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFiltersPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange?.({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== undefined && filter !== '' && 
    (Array.isArray(filter) ? filter.length > 0 : true)
  );

  const suggestions = aiSuggestions?.data?.suggestions || [];

  return (
    <div ref={searchRef} className={cn('relative w-full max-w-2xl', className)}>
      {/* Main search input */}
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-20"
          leftIcon={<Search className="h-4 w-4 text-gray-400" />}
          onFocus={() => setShowSuggestions(true)}
          aria-label="Search recipes"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* AI suggestions toggle */}
          {showAISuggestions && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                debouncedSearch.length > 2 && 'text-primary-600'
              )}
              onClick={() => setShowSuggestions(!showSuggestions)}
              ariaLabel="Toggle AI suggestions"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
          
          {/* Filters toggle */}
          {showFilters && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                (showFiltersPanel || hasActiveFilters) && 'text-primary-600'
              )}
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              ariaLabel="Toggle search filters"
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -right-1 -top-1 flex h-2 w-2 items-center justify-center rounded-full bg-primary-600">
                  <span className="sr-only">Active filters</span>
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && showAISuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
          {isLoadingSuggestions ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Generating AI suggestions...
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div role="listbox" aria-label="AI recipe suggestions">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                AI Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={() => {
                    onChange(suggestion);
                    setShowSuggestions(false);
                  }}
                  role="option"
                  aria-selected={false}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary-500" />
                    {suggestion}
                  </div>
                </button>
              ))}
            </div>
          ) : debouncedSearch.length > 2 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No AI suggestions available
            </div>
          ) : null}
        </div>
      )}

      {/* Filters Panel */}
      {showFiltersPanel && showFilters && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Filters</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={clearFilters}
                  className="text-gray-500"
                >
                  Clear all
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowFiltersPanel(false)}
                ariaLabel="Close filters"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cuisine filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine
              </label>
              <select
                value={filters.cuisine || ''}
                onChange={(e) => handleFilterChange({ cuisine: e.target.value || undefined })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Any cuisine</option>
                <option value="italian">Italian</option>
                <option value="chinese">Chinese</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
                <option value="american">American</option>
                <option value="mediterranean">Mediterranean</option>
              </select>
            </div>

            {/* Difficulty filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange({ 
                  difficulty: e.target.value as SearchFilters['difficulty'] || undefined 
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Any difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Max prep time filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max prep time
              </label>
              <select
                value={filters.maxPrepTime || ''}
                onChange={(e) => handleFilterChange({ 
                  maxPrepTime: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Any time</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {/* Dietary restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary
              </label>
              <select
                multiple
                value={filters.dietaryRestrictions || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange({ dietaryRestrictions: values.length > 0 ? values : undefined });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                size={3}
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten_free">Gluten-free</option>
                <option value="dairy_free">Dairy-free</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};