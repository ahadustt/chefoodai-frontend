/**
 * AI-Enhanced Shopping List Item Component
 * Showcases AI intelligence with confidence indicators, optimization suggestions, and smart features
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Package,
  Sparkles,
  Brain,
  TrendingUp,
  Info,
  ShoppingBag,
  Zap,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ShoppingListItem, IngredientCategory, getCategoryColor } from '../../services/shoppingListApi';

interface AIEnhancedShoppingItemProps {
  item: ShoppingListItem;
  onToggle: (itemId: string, isPurchased: boolean) => void;
  onUpdate?: (itemId: string, updates: any) => void;
  showAIFeatures?: boolean;
  className?: string;
}

export const AIEnhancedShoppingItem: React.FC<AIEnhancedShoppingItemProps> = ({
  item,
  onToggle,
  onUpdate,
  showAIFeatures = true,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // AI Enhancement Analysis
  const hasAIEnhancement = item.confidence_score !== undefined;
  const isHighConfidence = (item.confidence_score || 0) >= 0.9;
  const hasBulkOpportunity = item.bulk_opportunity;
  const hasOptimizationNotes = item.optimization_notes && item.optimization_notes.length > 0;
  const hasPackageSuggestion = item.package_suggestion && item.package_suggestion.length > 0;

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggle(item.id, !item.is_purchased);
    } finally {
      setIsUpdating(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50';
    if (score >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.9) return Star;
    if (score >= 0.7) return Zap;
    return AlertTriangle;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group ${className}`}
    >
      <div
        className={`
          border rounded-lg p-4 transition-all duration-200
          ${item.is_purchased 
            ? 'bg-gray-50 border-gray-200 opacity-75' 
            : 'bg-white border-gray-200 hover:border-chef-300 hover:shadow-md'
          }
          ${hasAIEnhancement ? 'ring-1 ring-chef-100' : ''}
        `}
      >
        {/* Main Item Row */}
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            disabled={isUpdating}
            className={`
              flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all
              ${item.is_purchased
                ? 'bg-chef-500 border-chef-500 text-white'
                : 'border-gray-300 hover:border-chef-400 hover:bg-chef-50'
              }
              ${isUpdating ? 'animate-pulse' : ''}
            `}
          >
            {item.is_purchased && <Check className="h-4 w-4" />}
          </motion.button>

          {/* Item Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium ${item.is_purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {item.ingredient_name}
              </h4>
              
              {/* AI Confidence Indicator */}
              {hasAIEnhancement && showAIFeatures && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1"
                >
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getConfidenceColor(item.confidence_score!)}`}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    AI {Math.round((item.confidence_score || 0) * 100)}%
                  </Badge>
                  
                  {isHighConfidence && (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Sparkles className="h-4 w-4 text-chef-500" />
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Bulk Opportunity Indicator */}
              {hasBulkOpportunity && showAIFeatures && (
                <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Bulk
                </Badge>
              )}
            </div>

            {/* Quantity and Category */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">
                {item.quantity} {item.unit}
              </span>
              
              <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                {item.category.replace('_', ' ')}
              </Badge>

              {/* Package Suggestion */}
              {hasPackageSuggestion && showAIFeatures && (
                <span className="text-chef-600 font-medium">
                  📦 {item.package_suggestion}
                </span>
              )}
            </div>

            {/* AI Optimization Notes Preview */}
            {hasOptimizationNotes && showAIFeatures && !showDetails && (
              <div className="mt-2 text-xs text-chef-600 bg-chef-50 rounded-md p-2 border border-chef-200">
                <div className="flex items-center gap-1 mb-1">
                  <Brain className="h-3 w-3" />
                  <span className="font-medium">AI Suggestion:</span>
                </div>
                <p className="line-clamp-2">{item.optimization_notes}</p>
              </div>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {(hasOptimizationNotes || hasAIEnhancement) && showAIFeatures && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {showDetails ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Expanded AI Details */}
        <AnimatePresence>
          {showDetails && showAIFeatures && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="space-y-3">
                {/* AI Processing Details */}
                {hasAIEnhancement && (
                  <div className="bg-gradient-to-r from-chef-50 to-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-chef-600" />
                      <span className="font-medium text-chef-800">AI Enhancement Details</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Confidence:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full ${
                                isHighConfidence ? 'bg-green-500' : 
                                (item.confidence_score || 0) >= 0.7 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.confidence_score || 0) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                          <span className="font-medium text-gray-800">
                            {Math.round((item.confidence_score || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {item.preparation && (
                        <div>
                          <span className="text-gray-600">Preparation:</span>
                          <p className="font-medium text-gray-800 capitalize">{item.preparation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Optimization Suggestions */}
                {hasOptimizationNotes && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Smart Shopping Tip</span>
                    </div>
                    <p className="text-sm text-purple-700">{item.optimization_notes}</p>
                  </div>
                )}

                {/* Package Information */}
                {hasPackageSuggestion && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-800">Package Optimization</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-700">
                        Suggested package: <span className="font-medium">{item.package_suggestion}</span>
                      </span>
                      {hasBulkOpportunity && (
                        <Badge className="bg-purple-100 text-purple-700">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Bulk Opportunity
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Recipe Sources */}
                {item.recipe_sources && item.recipe_sources.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-800">Needed for:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.recipe_sources.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source.recipe_title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
