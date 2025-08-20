import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle, 
  CheckCircle,
  Activity,
  Zap,
  Heart
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

interface NutritionAnalysis {
  analytics: {
    total_calories: number;
    avg_calories_per_day: number;
    total_protein: number;
    total_carbohydrates: number;
    total_fat: number;
    total_fiber: number;
    total_sodium: number;
    protein_percentage: number;
    carb_percentage: number;
    fat_percentage: number;
    nutritional_balance_score: number;
    goal_achievement_score: number;
  };
  recommendations: Array<{
    recommendation_type: 'increase' | 'decrease' | 'maintain' | 'caution';
    nutrient: string;
    current_amount: number;
    target_amount: number;
    priority: number;
    reason: string;
    specific_foods: string[];
    health_impact: string;
  }>;
}

interface NutritionAnalyzerProps {
  mealPlanId: number;
}

export const NutritionAnalyzer: React.FC<NutritionAnalyzerProps> = ({ mealPlanId }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  const { data: nutritionData, isLoading } = useQuery({
    queryKey: ['nutrition-analysis', mealPlanId],
    queryFn: () => api.get(`/meal-plans/${mealPlanId}/nutrition-analysis`).then(res => res.data as NutritionAnalysis)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!nutritionData) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Nutrition Data Available
        </h3>
        <p className="text-gray-500">
          Complete your meal plan to see detailed nutritional analysis.
        </p>
      </Card>
    );
  }

  const { analytics, recommendations } = nutritionData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'maintain':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'caution':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) return 'bg-red-100 text-red-800';
    if (priority >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return 'High';
    if (priority >= 3) return 'Medium';
    return 'Low';
  };

  const renderOverviewMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Daily Calories</p>
            <p className="text-2xl font-semibold text-gray-900">
              {Math.round(analytics.avg_calories_per_day)}
            </p>
          </div>
          <Zap className="h-8 w-8 text-orange-600" />
        </div>
        <div className="mt-2">
          <div className="text-xs text-gray-500">Target: 2000 cal</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-orange-600 h-2 rounded-full" 
              style={{ width: `${Math.min(100, (analytics.avg_calories_per_day / 2000) * 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Balance Score</p>
            <p className={`text-2xl font-semibold ${getScoreColor(analytics.nutritional_balance_score)}`}>
              {Math.round(analytics.nutritional_balance_score)}%
            </p>
          </div>
          <BarChart3 className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="mt-2">
          <div className={`text-xs px-2 py-1 rounded-full ${getScoreBackground(analytics.nutritional_balance_score)}`}>
            {analytics.nutritional_balance_score >= 80 ? 'Excellent' : 
             analytics.nutritional_balance_score >= 60 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Goal Achievement</p>
            <p className={`text-2xl font-semibold ${getScoreColor(analytics.goal_achievement_score)}`}>
              {Math.round(analytics.goal_achievement_score)}%
            </p>
          </div>
          <Target className="h-8 w-8 text-green-600" />
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${analytics.goal_achievement_score}%` }}
            ></div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Health Score</p>
            <p className="text-2xl font-semibold text-purple-600">
              85%
            </p>
          </div>
          <Heart className="h-8 w-8 text-purple-600" />
        </div>
        <div className="mt-2">
          <div className="text-xs text-purple-600">Very Healthy</div>
        </div>
      </Card>
    </div>
  );

  const renderMacroBreakdown = () => (
    <Card className="p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Macronutrient Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(analytics.protein_percentage)}%
          </div>
          <div className="text-sm text-gray-600 mb-2">Protein</div>
          <div className="text-xs text-gray-500">
            {Math.round(analytics.total_protein)}g total
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round(analytics.carb_percentage)}%
          </div>
          <div className="text-sm text-gray-600 mb-2">Carbohydrates</div>
          <div className="text-xs text-gray-500">
            {Math.round(analytics.total_carbohydrates)}g total
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {Math.round(analytics.fat_percentage)}%
          </div>
          <div className="text-sm text-gray-600 mb-2">Fat</div>
          <div className="text-xs text-gray-500">
            {Math.round(analytics.total_fat)}g total
          </div>
        </div>
      </div>

      {/* Macro Distribution Chart */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-blue-600"
          style={{ width: `${analytics.protein_percentage}%` }}
        ></div>
        <div 
          className="absolute top-0 h-full bg-green-600"
          style={{ 
            left: `${analytics.protein_percentage}%`,
            width: `${analytics.carb_percentage}%` 
          }}
        ></div>
        <div 
          className="absolute top-0 h-full bg-yellow-600"
          style={{ 
            left: `${analytics.protein_percentage + analytics.carb_percentage}%`,
            width: `${analytics.fat_percentage}%` 
          }}
        ></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Nutrients</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fiber:</span>
              <span className="font-medium">{Math.round(analytics.total_fiber)}g</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sodium:</span>
              <span className="font-medium">{Math.round(analytics.total_sodium)}mg</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recommendations</h4>
          <div className="text-sm text-gray-600">
            {analytics.protein_percentage < 15 && (
              <div className="text-yellow-600">• Consider increasing protein intake</div>
            )}
            {analytics.fiber < 25 && (
              <div className="text-yellow-600">• Add more fiber-rich foods</div>
            )}
            {analytics.sodium > 2300 && (
              <div className="text-red-600">• Reduce sodium intake</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderRecommendations = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Personalized Recommendations
      </h3>
      
      <div className="space-y-4">
        {recommendations.slice(0, 5).map((recommendation, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getRecommendationIcon(recommendation.recommendation_type)}
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {recommendation.recommendation_type} {recommendation.nutrient}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {recommendation.reason}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(recommendation.priority)}`}>
                {getPriorityLabel(recommendation.priority)} Priority
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Current</div>
                <div className="font-medium text-gray-900">
                  {Math.round(recommendation.current_amount)} 
                  {recommendation.nutrient === 'calories' ? ' cal' : 
                   recommendation.nutrient === 'protein' || recommendation.nutrient === 'fiber' ? 'g' : 
                   recommendation.nutrient === 'sodium' ? 'mg' : ''}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Target</div>
                <div className="font-medium text-gray-900">
                  {Math.round(recommendation.target_amount)}
                  {recommendation.nutrient === 'calories' ? ' cal' : 
                   recommendation.nutrient === 'protein' || recommendation.nutrient === 'fiber' ? 'g' : 
                   recommendation.nutrient === 'sodium' ? 'mg' : ''}
                </div>
              </div>
            </div>

            {recommendation.specific_foods.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-2">Recommended Foods:</div>
                <div className="flex flex-wrap gap-1">
                  {recommendation.specific_foods.slice(0, 4).map((food, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {food}
                    </span>
                  ))}
                  {recommendation.specific_foods.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{recommendation.specific_foods.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
              <strong>Health Impact:</strong> {recommendation.health_impact}
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 5 && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Recommendations ({recommendations.length})
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'macros', name: 'Macronutrients', icon: BarChart3 },
            { id: 'recommendations', name: 'Recommendations', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedMetric === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {selectedMetric === 'overview' && (
        <>
          {renderOverviewMetrics()}
          {renderMacroBreakdown()}
        </>
      )}

      {selectedMetric === 'macros' && renderMacroBreakdown()}

      {selectedMetric === 'recommendations' && renderRecommendations()}
    </div>
  );
};