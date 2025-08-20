/**
 * ShoppingListView Component
 * Main shopping list display with categorized items and purchase tracking
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ShoppingCart,
  Package,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronRight,
  MapPin,
  Users,
  Calendar,
  MoreVertical,
  Edit3,
  Share2,
  Printer,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AIEnhancedShoppingItem } from './AIEnhancedShoppingItem';
import { AIShoppingListHeader } from './AIShoppingListHeader';
import { 
  ShoppingList, 
  ShoppingListItem, 
  IngredientCategory,
  getCategoryDisplayName,
  getCategoryColor,
  formatQuantity 
} from '../../services/shoppingListApi';

interface ShoppingListViewProps {
  shoppingList: ShoppingList;
  onItemToggle: (itemId: string, isPurchased: boolean) => void;
  onItemUpdate?: (itemId: string, updates: any) => void;
  onShare?: () => void;
  onPrint?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isUpdating?: boolean;
  className?: string;
}

interface CategoryGroup {
  category: IngredientCategory;
  items: ShoppingListItem[];
  totalItems: number;
  purchasedItems: number;
  estimatedCost: number;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  onItemToggle,
  onItemUpdate,
  onShare,
  onPrint,
  onEdit,
  onDelete,
  isUpdating = false,
  className = ''
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<IngredientCategory>>(
    new Set(Object.values(IngredientCategory))
  );
  const [showActions, setShowActions] = useState(false);

  // Group items by category
  const categoryGroups = useMemo((): CategoryGroup[] => {
    const groups = new Map<IngredientCategory, ShoppingListItem[]>();
    
    // Initialize all categories
    Object.values(IngredientCategory).forEach(category => {
      groups.set(category, []);
    });
    
    // Group items by category
    shoppingList.items.forEach(item => {
      const category = item.category || IngredientCategory.OTHER;
      const categoryItems = groups.get(category) || [];
      categoryItems.push(item);
      groups.set(category, categoryItems);
    });
    
    // Convert to CategoryGroup array and filter out empty categories
    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name)),
        totalItems: items.length,
        purchasedItems: items.filter(item => item.is_purchased).length,
        estimatedCost: items.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
      }))
      .filter(group => group.totalItems > 0)
      .sort((a, b) => getCategoryDisplayName(a.category).localeCompare(getCategoryDisplayName(b.category)));
  }, [shoppingList.items]);

  const toggleCategory = (category: IngredientCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleItemToggle = (item: ShoppingListItem) => {
    onItemToggle(item.id, !item.is_purchased);
  };

  const completionPercentage = shoppingList.total_items > 0 
    ? Math.round((shoppingList.purchased_items / shoppingList.total_items) * 100)
    : 0;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* AI-Enhanced Header */}
      <AIShoppingListHeader shoppingList={shoppingList} />

      {/* Legacy Header (remove this block) */}
      <Card className="p-6" style={{display: 'none'}}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-6 w-6 text-chef-600" />
              <h1 className="text-2xl font-bold text-gray-900">{shoppingList.name}</h1>
              {shoppingList.meal_plan_id && (
                <span className="px-2 py-1 bg-chef-100 text-chef-700 text-xs rounded-full">
                  From Meal Plan
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>{shoppingList.purchased_items} of {shoppingList.total_items} items</span>
              </div>
              
              {shoppingList.total_estimated_cost && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>~${shoppingList.total_estimated_cost.toFixed(2)}</span>
                </div>
              )}
              
              {shoppingList.shop_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Shop by {new Date(shoppingList.shop_date).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated {new Date(shoppingList.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-chef-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {completionPercentage}%
              </span>
            </div>
            
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="flex items-center gap-1"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                  >
                    {onEdit && (
                      <button
                        onClick={() => { onEdit(); setShowActions(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit List
                      </button>
                    )}
                    {onShare && (
                      <button
                        onClick={() => { onShare(); setShowActions(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    )}
                    {onPrint && (
                      <button
                        onClick={() => { onPrint(); setShowActions(false); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </button>
                    )}
                    {onDelete && (
                      <>
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={() => { onDelete(); setShowActions(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete List
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Groups */}
      <div className="space-y-4">
        {categoryGroups.map((group) => (
          <motion.div
            key={group.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(group.category)}
              className="w-full px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedCategories.has(group.category) ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
                  {getCategoryDisplayName(group.category)}
                </span>
                
                <span className="text-sm text-gray-600">
                  {group.purchasedItems} of {group.totalItems} items
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {group.estimatedCost > 0 && (
                  <span className="text-sm text-gray-600">
                    ~${group.estimatedCost.toFixed(2)}
                  </span>
                )}
                
                <div className="w-16 bg-gray-200 rounded-full h-1">
                  <motion.div 
                    className="bg-chef-500 h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${group.totalItems > 0 ? (group.purchasedItems / group.totalItems) * 100 : 0}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </button>

            {/* Category Items */}
            <AnimatePresence>
              {expandedCategories.has(group.category) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {group.items.map((item, index) => (
                      <AIEnhancedShoppingItem
                        key={item.id}
                        item={item}
                        onToggle={onItemToggle}
                        onUpdate={onItemUpdate}
                        showAIFeatures={true}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      {/* Empty State */}
      {shoppingList.items.length === 0 && (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items in your shopping list</h3>
          <p className="text-gray-600">
            Add items manually or generate a list from your meal plans.
          </p>
        </Card>
      )}
    </div>
  );
};
