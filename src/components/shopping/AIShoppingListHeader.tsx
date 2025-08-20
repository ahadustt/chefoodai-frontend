/**
 * AI Shopping List Header Component
 * Displays AI enhancement statistics and intelligence indicators
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  Target,
  Award,
  Cpu,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ShoppingList } from '../../services/shoppingListApi';

interface AIShoppingListHeaderProps {
  shoppingList: ShoppingList;
  className?: string;
}

export const AIShoppingListHeader: React.FC<AIShoppingListHeaderProps> = ({
  shoppingList,
  className = ''
}) => {
  const aiData = shoppingList.ai_enhancement;
  const hasAI = aiData?.used_ai || false;
  
  if (!hasAI || !aiData) {
    // Standard shopping list header
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shoppingList.name}</h1>
            <p className="text-gray-600 mt-1">
              {shoppingList.total_items} items • Created {new Date(shoppingList.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="outline">Standard List</Badge>
        </div>
      </Card>
    );
  }

  // AI-Enhanced Header
  const confidenceLevel = aiData.confidence_average >= 0.9 ? 'exceptional' : 
                         aiData.confidence_average >= 0.7 ? 'high' : 'good';
  
  const optimizationBadge = {
    basic: { color: 'bg-blue-100 text-blue-700', icon: Zap, label: 'Basic AI' },
    standard: { color: 'bg-purple-100 text-purple-700', icon: Brain, label: 'Smart AI' },
    premium: { color: 'bg-gradient-to-r from-chef-100 to-purple-100 text-chef-700', icon: Sparkles, label: 'Premium AI' }
  };

  const optConfig = optimizationBadge[aiData.optimization_level] || optimizationBadge.standard;
  const OptIcon = optConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="p-6 bg-gradient-to-r from-chef-50 via-white to-purple-50 border-chef-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{shoppingList.name}</h1>
              
              {/* AI Enhancement Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className={`${optConfig.color} font-medium`}>
                  <OptIcon className="h-3 w-3 mr-1" />
                  {optConfig.label}
                </Badge>
              </motion.div>

              {/* High Confidence Indicator */}
              {aiData.confidence_average >= 0.9 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700">
                    <Award className="h-3 w-3 mr-1" />
                    Exceptional Quality
                  </Badge>
                </motion.div>
              )}
            </div>

            <p className="text-gray-600">
              {shoppingList.total_items} items • Generated with AI intelligence • 
              Created {new Date(shoppingList.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* AI Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Confidence Score */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-3 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-chef-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                {Math.round(aiData.confidence_average * 100)}%
              </span>
              <span className={`text-xs font-medium ${
                aiData.confidence_average >= 0.9 ? 'text-green-600' :
                aiData.confidence_average >= 0.7 ? 'text-amber-600' : 'text-blue-600'
              }`}>
                {confidenceLevel}
              </span>
            </div>
            
            {/* Confidence Progress Bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <motion.div
                className={`h-1 rounded-full ${
                  aiData.confidence_average >= 0.9 ? 'bg-green-500' :
                  aiData.confidence_average >= 0.7 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${aiData.confidence_average * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Processing Time */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-3 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-gray-900">
                {aiData.processing_time.toFixed(1)}s
              </span>
              <span className="text-xs text-blue-600 font-medium">fast</span>
            </div>
          </motion.div>

          {/* Fallback Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-3 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">AI Usage</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-gray-900">
                {aiData.fallback_count === 0 ? '100' : Math.round((1 - aiData.fallback_count / 3) * 100)}%
              </span>
              <span className="text-xs text-purple-600 font-medium">
                {aiData.fallback_count === 0 ? 'pure AI' : 'hybrid'}
              </span>
            </div>
          </motion.div>

          {/* Model Used */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg p-3 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Model</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-gray-900">
                {aiData.optimization_level === 'premium' ? 'Gemini 2.0' : 
                 aiData.optimization_level === 'standard' ? 'Gemini 1.5' : 'Gemini Pro'}
              </span>
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            </div>
          </motion.div>
        </div>

        {/* AI Features Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex flex-wrap gap-2"
        >
          <Badge variant="secondary" className="bg-chef-100 text-chef-700">
            <Sparkles className="h-3 w-3 mr-1" />
            Smart Categorization
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Brain className="h-3 w-3 mr-1" />
            Ingredient Cleaning
          </Badge>
          {aiData.optimization_level === 'premium' && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Quantity Optimization
            </Badge>
          )}
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {aiData.fallback_count === 0 ? 'Zero Fallbacks' : 'Hybrid Processing'}
          </Badge>
        </motion.div>
      </Card>
    </motion.div>
  );
};
