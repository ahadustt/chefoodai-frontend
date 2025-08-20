/**
 * ShoppingListGenerator Component
 * Generate shopping lists from meal plans with customization options
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Calendar,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  Check,
  X,
  Loader2,
  ArrowRight,
  ChefHat,
  AlertCircle,
  Info,
  Brain,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { mealPlanningApi, type MealPlan } from '../../services/mealPlanningApi';
import { shoppingListApi, GenerateShoppingListRequest, ShoppingList } from '../../services/shoppingListApi';

interface ShoppingListGeneratorProps {
  onGenerated?: (shoppingList: ShoppingList) => void;
  onCancel?: () => void;
  preselectedMealPlanId?: string;
  className?: string;
}

export const ShoppingListGenerator: React.FC<ShoppingListGeneratorProps> = ({
  onGenerated,
  onCancel,
  preselectedMealPlanId,
  className = ''
}) => {
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<string>(preselectedMealPlanId || '');
  const [customName, setCustomName] = useState('');
  const [options, setOptions] = useState({
    exclude_pantry_items: true,
    group_by_store_section: true,
    optimize_quantities: true,
    use_ai_enhancement: true,
    optimization_level: 'standard' as 'basic' | 'standard' | 'premium'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch meal plans
  const { data: mealPlansData, isLoading: loadingMealPlans } = useQuery({
    queryKey: ['meal-plans'],
    queryFn: mealPlanningApi.getMealPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Generate shopping list mutation
  const generateMutation = useMutation({
    mutationFn: async (data: GenerateShoppingListRequest) => {
      return shoppingListApi.generateFromMealPlan(data);
    },
    onSuccess: (shoppingList) => {
      toast.success('Shopping list generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      onGenerated?.(shoppingList);
    },
    onError: (error: any) => {
      console.error('Failed to generate shopping list:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate shopping list');
    },
  });

  const mealPlans = mealPlansData?.meal_plans || [];
  const selectedMealPlan = mealPlans.find(plan => plan.id === selectedMealPlanId);

  const handleGenerate = () => {
    if (!selectedMealPlanId) {
      toast.error('Please select a meal plan');
      return;
    }

    const request: GenerateShoppingListRequest = {
      meal_plan_id: selectedMealPlanId,
      name: customName.trim() || undefined,
      ...options
    };

    generateMutation.mutate(request);
  };

  const getGeneratedName = () => {
    if (customName.trim()) return customName.trim();
    if (selectedMealPlan) return `Shopping for ${selectedMealPlan.name}`;
    return 'My Shopping List';
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-chef-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generate Shopping List</h2>
            <p className="text-gray-600">Create an intelligent shopping list from your meal plans</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Select Meal Plan */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-chef-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
              Select Meal Plan
            </h3>
            
            {loadingMealPlans ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </Card>
                ))}
              </div>
            ) : mealPlans.length === 0 ? (
              <Card className="p-6 text-center">
                <ChefHat className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">No meal plans available</h4>
                <p className="text-gray-600 text-sm">
                  You need to create a meal plan first before generating a shopping list.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mealPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer transition-all ${
                        selectedMealPlanId === plan.id 
                          ? 'ring-2 ring-chef-500 border-chef-500 bg-chef-50' 
                          : 'border-gray-200 hover:border-chef-300'
                      }`}
                      onClick={() => setSelectedMealPlanId(plan.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 line-clamp-2">{plan.name}</h4>
                        {selectedMealPlanId === plan.id && (
                          <Check className="h-5 w-5 text-chef-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{plan.duration_days} days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{plan.family_size} people</span>
                        </div>
                        {plan.total_recipes && (
                          <div className="flex items-center gap-1">
                            <ChefHat className="h-4 w-4" />
                            <span>{plan.total_recipes} recipes</span>
                          </div>
                        )}
                      </div>
                      
                      {plan.status && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            plan.status === 'active' 
                              ? 'bg-green-100 text-green-700'
                              : plan.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Customize Options */}
          {selectedMealPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-chef-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                Customize Shopping List
              </h3>
              
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shopping List Name (Optional)
                    </label>
                    <Input
                      placeholder={`Shopping for ${selectedMealPlan.name}`}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Advanced Options</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      {showAdvanced ? 'Hide' : 'Show'} Options
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 pt-2 border-t border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Smart Pantry</span>
                            <div className="group relative">
                              <Info className="h-4 w-4 text-gray-400" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                                Exclude common pantry items you likely already have
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={options.exclude_pantry_items}
                            onChange={(e) => setOptions(prev => ({ ...prev, exclude_pantry_items: e.target.checked }))}
                            className="rounded border-gray-300 text-chef-600 focus:ring-chef-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Store Organization</span>
                            <div className="group relative">
                              <Info className="h-4 w-4 text-gray-400" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                                Group items by grocery store sections for efficient shopping
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={options.group_by_store_section}
                            onChange={(e) => setOptions(prev => ({ ...prev, group_by_store_section: e.target.checked }))}
                            className="rounded border-gray-300 text-chef-600 focus:ring-chef-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Quantity Optimization</span>
                            <div className="group relative">
                              <Info className="h-4 w-4 text-gray-400" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                                Optimize quantities for package sizes and minimize waste
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={options.optimize_quantities}
                            onChange={(e) => setOptions(prev => ({ ...prev, optimize_quantities: e.target.checked }))}
                            className="rounded border-gray-300 text-chef-600 focus:ring-chef-500"
                          />
                        </div>

                        {/* AI Enhancement Section */}
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-5 w-5 text-chef-600" />
                            <h4 className="font-medium text-gray-900">AI Enhancement</h4>
                            <span className="px-2 py-1 bg-gradient-to-r from-chef-100 to-purple-100 text-chef-700 text-xs rounded-full font-medium">
                              ✨ NEW
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-chef-600" />
                                Enable AI Enhancement
                              </h4>
                              <p className="text-sm text-gray-600">96%+ accuracy vs 66% rule-based categorization</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={options.use_ai_enhancement}
                              onChange={(e) => setOptions(prev => ({ ...prev, use_ai_enhancement: e.target.checked }))}
                              className="rounded border-gray-300 text-chef-600 focus:ring-chef-500"
                            />
                          </div>

                          {/* AI Optimization Level */}
                          <AnimatePresence>
                            {options.use_ai_enhancement && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3"
                              >
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">AI Optimization Level</h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setOptions(prev => ({ ...prev, optimization_level: 'basic' }))}
                                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                        options.optimization_level === 'basic'
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <Zap className="h-4 w-4 mx-auto mb-1" />
                                      Basic
                                      <div className="text-xs text-gray-500 mt-1">Fast & Free</div>
                                    </button>
                                    
                                    <button
                                      type="button"
                                      onClick={() => setOptions(prev => ({ ...prev, optimization_level: 'standard' }))}
                                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                        options.optimization_level === 'standard'
                                          ? 'border-chef-500 bg-chef-50 text-chef-700'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <Brain className="h-4 w-4 mx-auto mb-1" />
                                      Standard
                                      <div className="text-xs text-gray-500 mt-1">Recommended</div>
                                    </button>
                                    
                                    <button
                                      type="button"
                                      onClick={() => setOptions(prev => ({ ...prev, optimization_level: 'premium' }))}
                                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                        options.optimization_level === 'premium'
                                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <Sparkles className="h-4 w-4 mx-auto mb-1" />
                                      Premium
                                      <div className="text-xs text-gray-500 mt-1">Best Quality</div>
                                    </button>
                                  </div>
                                </div>

                                {/* AI Features Preview */}
                                <div className="bg-gradient-to-r from-chef-50 to-purple-50 rounded-lg p-3 border border-chef-200">
                                  <h5 className="font-medium text-chef-800 mb-2 flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    AI Features for {options.optimization_level} level:
                                  </h5>
                                  <ul className="text-sm text-chef-700 space-y-1">
                                    <li className="flex items-center gap-2">
                                      <Check className="h-3 w-3 text-green-600" />
                                      Smart ingredient categorization (96%+ accuracy)
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <Check className="h-3 w-3 text-green-600" />
                                      Intelligent name cleaning ("boneless" → "chicken breast")
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <Check className="h-3 w-3 text-green-600" />
                                      Context-aware unit conversions
                                    </li>
                                    {options.optimization_level === 'premium' && (
                                      <li className="flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3 text-purple-600" />
                                        Package optimization & bulk buying suggestions
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Preview and Generate */}
          {selectedMealPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-chef-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                Review and Generate
              </h3>
              
              <Card className="p-4 bg-chef-50 border-chef-200">
                <div className="flex items-start gap-4">
                  <ShoppingCart className="h-8 w-8 text-chef-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{getGeneratedName()}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Ingredients from <strong>{selectedMealPlan.name}</strong></p>
                      <p>• {selectedMealPlan.duration_days} days of meals for {selectedMealPlan.family_size} people</p>
                      {options.exclude_pantry_items && <p>• Smart pantry filtering enabled</p>}
                      {options.group_by_store_section && <p>• Organized by store sections</p>}
                      {options.optimize_quantities && <p>• Quantities optimized for packages</p>}
                      {options.use_ai_enhancement && (
                        <p className="text-chef-600 font-medium flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI Enhancement: {options.optimization_level} level (96%+ accuracy)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={generateMutation.isPending}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleGenerate}
            disabled={!selectedMealPlan || generateMutation.isPending}
            className={`flex items-center gap-2 ${
              options.use_ai_enhancement 
                ? 'bg-gradient-to-r from-chef-500 to-purple-500 hover:from-chef-600 hover:to-purple-600' 
                : ''
            }`}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {options.use_ai_enhancement ? 'AI Processing...' : 'Generating...'}
              </>
            ) : (
              <>
                {options.use_ai_enhancement ? (
                  <Brain className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {options.use_ai_enhancement 
                  ? `Generate with AI (${options.optimization_level})` 
                  : 'Generate Shopping List'
                }
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
