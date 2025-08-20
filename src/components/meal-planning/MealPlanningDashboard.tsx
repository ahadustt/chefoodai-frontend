import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  Calendar,
  TrendingUp,
  Users,
  ChefHat,
  BarChart3,
  Target,
  Clock,
  DollarSign,
  Star,
  Trash2,
  MoreVertical,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  Loader2,
  Sparkles,
  Search
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmationModal } from '../ui/ConfirmationModal';

import { MealPlanCreator } from './MealPlanCreator';
import { MealPlanView } from './MealPlanView';
import { CookingAnimation } from '../animations/CookingAnimations';
import { mealPlanningApi, type MealPlan, type MealPlanListResponse } from '../../services/mealPlanningApi';

interface MealPlanningDashboardProps {
  creatingMealPlan?: {
    id: string;
    name: string;
    isGenerating: boolean;
    progress: number;
    currentStep: string;
    estimatedTime: string;
    duration_days?: number;
    totalMeals?: number;
    completedMeals?: number;
    family_size?: number;
  } | null;
  onGenerationProgress?: (progress: number, step: string, estimatedTime?: string) => void;
  onGenerationComplete?: (mealPlan: any) => void;
}

export const MealPlanningDashboard: React.FC<MealPlanningDashboardProps> = ({ 
  creatingMealPlan, 
  onGenerationProgress, 
  onGenerationComplete 
}) => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: mealPlansData, isLoading, refetch } = useQuery({
    queryKey: ['meal-plans'],
    queryFn: () => mealPlanningApi.getMealPlans(),
    // Enhanced refresh behavior with polling for real-time updates
    staleTime: 2 * 1000, // 2 seconds - meal plans change frequently during generation
    refetchInterval: creatingMealPlan ? 2000 : 15000, // Poll every 2s during generation, 15s otherwise
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Force immediate refetch when creating meal plan
    enabled: true,
  });

  // Show only first 6 meal plans on dashboard
  const allMealPlans = mealPlansData?.meal_plans || [];
  const maxDashboardMealPlans = 6
  const dashboardMealPlans = allMealPlans.slice(0, maxDashboardMealPlans)
  const hasMoreMealPlans = allMealPlans.length > maxDashboardMealPlans

  // Auto-refresh when component mounts or becomes visible
  useEffect(() => {
    console.log('🔄 Meal Planning Dashboard mounted - ensuring fresh data...');
    
    // Invalidate and refetch meal plans to ensure freshness
    queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    
    // Add visibility change listener for additional freshness
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible - refreshing meal plans...');
        queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  // Force refresh when creating meal plan state changes
  useEffect(() => {
    if (creatingMealPlan) {
      console.log('🔄 Creating meal plan detected, forcing immediate refresh...');
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      refetch();
    }
  }, [creatingMealPlan, queryClient, refetch]);

  // Check for meal plan completion and update creating meal plan state
  useEffect(() => {
    if (creatingMealPlan && mealPlansData?.meal_plans) {
      // Look for the meal plan with the temp ID or the same name
      const realMealPlan = mealPlansData.meal_plans.find(plan => 
        plan.name === creatingMealPlan.name && 
        !plan.id.startsWith('temp-') &&
        plan.status === 'active'
      );
      
      if (realMealPlan) {
        console.log('✅ Real meal plan found, updating progress to complete');
        // Notify parent component that generation is complete
        if (onGenerationComplete) {
          onGenerationComplete(realMealPlan);
        }
      }
    }
  }, [mealPlansData, creatingMealPlan, onGenerationComplete]);

  const handleCreateSuccess = (mealPlan: MealPlan) => {
    setShowCreator(false);
    // Only navigate to meal plan if it has a real ID
    if (mealPlan.id && !mealPlan.id.startsWith('temp-')) {
      setSelectedPlanId(mealPlan.id);
    }
  };

  const handleDeleteMealPlan = async (mealPlan: MealPlan, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the meal plan
    console.log('🗑️ Delete button clicked for meal plan:', mealPlan.name);
    
    // Show custom confirmation modal
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Meal Plan',
      message: `Are you sure you want to delete "${mealPlan.name}"? This action cannot be undone and will remove all planned meals.`,
      onConfirm: () => performDeleteMealPlan(mealPlan)
    });
  };

  const performDeleteMealPlan = async (mealPlan: MealPlan) => {
    try {
      console.log('🔥 Attempting to soft delete meal plan with ID:', mealPlan.id);
      
      // Show deleting toast
      const deletingToast = toast.loading('Deleting meal plan and all associated meals...', {
        duration: Infinity,
        position: 'top-center'
      });
      
      const result = await mealPlanningApi.deleteMealPlan(mealPlan.id);
      
      // Dismiss loading toast
      toast.dismiss(deletingToast);
      
      // Show detailed success message with impact
      const affectedDays = result.affected_items?.days || 0;
      const affectedMeals = result.affected_items?.meals || 0;
      
      let successMessage = 'Meal plan deleted successfully!';
      if (affectedMeals > 0) {
        successMessage += ` ${affectedDays} days and ${affectedMeals} meals were also removed.`;
      }
      if (result.details?.can_restore) {
        successMessage += ' You can restore it if needed.';
      }
        
      toast.success(successMessage, {
        duration: 5000,
        position: 'top-center'
      });
      
      // Refresh the meal plans list
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      
      // Close confirmation modal
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      
      console.log('✅ Meal plan soft deleted successfully:', {
        days: affectedDays,
        meals: affectedMeals,
        can_restore: result.details?.can_restore
      });
      
    } catch (error: any) {
      console.error('Failed to delete meal plan:', error);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete meal plan';
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center'
      });
      
      // Close confirmation modal even on error
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      draft: 'bg-yellow-100 text-yellow-800',
      generating: 'bg-purple-100 text-purple-800',
      paused: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getGoalIcon = (goal: string) => {
    const icons = {
      weight_loss: Target,
      muscle_gain: TrendingUp,
      balanced: BarChart3,
      heart_health: Target,
      diabetes_friendly: Target,
      low_carb: Target
    };
    return icons[goal as keyof typeof icons] || Target;
  };

  if (selectedPlanId) {
    // Find the current meal plan data for deletion
    const currentMealPlan = mealPlansData?.meal_plans.find(plan => plan.id === selectedPlanId);
    
    return (
      <MealPlanView
        mealPlanId={selectedPlanId}
        onEdit={() => {
          // Implement edit functionality
        }}
        onDelete={() => {
          if (currentMealPlan) {
            // Show confirmation modal for deletion
            setConfirmationModal({
              isOpen: true,
              title: 'Delete Meal Plan',
              message: `Are you sure you want to delete "${currentMealPlan.name}"? This action cannot be undone and will remove all planned meals.`,
              onConfirm: () => {
                performDeleteMealPlan(currentMealPlan);
                setSelectedPlanId(null); // Go back to dashboard after deletion
              }
            });
          }
        }}
      />
    );
  }

  if (showCreator) {
    return (
      <MealPlanCreator
        onSuccess={handleCreateSuccess}
      />
    );
  }

  const renderDashboardStats = () => {
    if (!mealPlansData || !mealPlansData.meal_plans || !Array.isArray(mealPlansData.meal_plans)) {
      return null;
    }

    const activePlans = mealPlansData.meal_plans.filter(plan => plan.status === 'active').length;
    const completedPlans = mealPlansData.meal_plans.filter(plan => plan.status === 'completed').length;
    const totalBudget = 0; // Remove budget calculation for now since it's not in the interface

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Plans</p>
              <p className="text-2xl font-semibold text-gray-900">{activePlans}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChefHat className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{completedPlans}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Weekly Budget</p>
              <p className="text-2xl font-semibold text-gray-900">${totalBudget}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Plans</p>
              <p className="text-2xl font-semibold text-gray-900">{mealPlansData.total}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderMealPlanCard = (mealPlan: MealPlan) => {
    return (
      <div key={mealPlan.id} className="group relative rounded-2xl bg-white/80 border border-gray-200/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden cursor-pointer">
        <div onClick={() => {
          // Prevent navigation to temporary meal plans
          if (!mealPlan.id.startsWith('temp-')) {
            setSelectedPlanId(mealPlan.id);
          }
        }} className="p-6">
          {/* Header with Animation */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Animation Container */}
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-chef-50/80 border border-chef-200/50">
                <CookingAnimation 
                  type="PREPARING_FOOD"
                  width={48}
                  height={48}
                  showFallback={false}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {mealPlan.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {mealPlan.duration_days} day{mealPlan.duration_days > 1 ? 's' : ''} meal plan
                </p>
              </div>
            </div>
            
            {/* Status and Delete */}
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mealPlan.status)}`}>
                {mealPlan.status}
              </span>
              <button
                onClick={(e) => handleDeleteMealPlan(mealPlan, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                title="Delete meal plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simple Info Row */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4 py-3 px-4 rounded-lg bg-gray-50/50">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-chef-600" />
                <span>{format(parseISO(mealPlan.start_date), 'MMM dd')} - {format(parseISO(mealPlan.end_date), 'MMM dd')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-chef-600" />
                <span>{mealPlan.target_calories_per_day || 2000} cal/day</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-4 h-4 text-chef-600" />
            <span className="text-sm text-gray-700 font-medium">
              {mealPlan.duration_days} day{mealPlan.duration_days === 1 ? '' : 's'}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
            <div className="text-xs text-gray-500">
              Starts {format(parseISO(mealPlan.start_date), 'MMM dd, yyyy')}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-chef-600 text-white border-0 hover:bg-chef-700 transition-colors duration-200 px-4 py-2"
            >
              <span>View Plan</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreatingMealPlanCard = () => {
    if (!creatingMealPlan) return null;
    
    // Check if there's a real meal plan with the same name that exists
    const realMealPlan = mealPlansData?.meal_plans?.find(plan => 
      plan.name === creatingMealPlan.name && 
      !plan.id.startsWith('temp-') &&
      plan.status === 'active'
    );
    
    const handleClick = () => {
      // Allow navigation to the real meal plan if it exists
      if (realMealPlan) {
        setSelectedPlanId(realMealPlan.id);
      } else if (creatingMealPlan.progress === 100 && !creatingMealPlan.id.startsWith('temp-')) {
        setSelectedPlanId(creatingMealPlan.id);
      }
    };
    
    return (
      <Card 
        key="creating-meal-plan" 
        className={`p-6 border-2 border-dashed border-purple-300 bg-purple-50 ${
          realMealPlan || (creatingMealPlan.progress === 100 && !creatingMealPlan.id.startsWith('temp-')) 
            ? 'cursor-pointer hover:shadow-lg transition-shadow' 
            : 'cursor-default'
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              <Sparkles className="w-3 h-3 text-purple-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">{creatingMealPlan.name}</h3>
              <p className="text-sm text-purple-600">Creating your meal plan...</p>
            </div>
          </div>
          {creatingMealPlan.progress !== undefined && creatingMealPlan.progress === 100 && (
            <CheckCircle className="w-6 h-6 text-green-600" />
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-purple-600 mb-2">
            <span>{creatingMealPlan.currentStep || 'Initializing...'}</span>
            <span>{creatingMealPlan.progress || 0}%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <motion.div
              className="bg-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${creatingMealPlan.progress || 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        
        {/* Status and Time */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="text-purple-700">{creatingMealPlan.duration_days} days</span>
            </div>
            {/* Live Meal Count Progress */}
            {creatingMealPlan.totalMeals && creatingMealPlan.completedMeals !== undefined && (
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-purple-500" />
                <span className="text-purple-700 font-medium">
                  {creatingMealPlan.completedMeals}/{creatingMealPlan.totalMeals} meals
                </span>
              </div>
            )}
          </div>
          {creatingMealPlan.estimatedTime && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-purple-700">{creatingMealPlan.estimatedTime}</span>
            </div>
          )}
        </div>
        
        {/* Completed Status */}
        {(creatingMealPlan.progress === 100 || realMealPlan) && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                {realMealPlan ? 'Meal plan ready!' : 'Meal plan created successfully!'}
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              {realMealPlan ? 'Click to view your meal plan with images' : 'Click to view your new meal plan'}
            </p>
          </div>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Card className="p-12 text-center">
      <ChefHat className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Meal Plans Yet
      </h3>
      <p className="text-gray-500 mb-6">
        Create your first AI-powered meal plan to get started with personalized nutrition planning.
      </p>
      <Button onClick={() => setShowCreator(true)} className="bg-indigo-600 hover:bg-indigo-700">
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Meal Plan
      </Button>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meal Planning</h1>
          <p className="text-gray-600 mt-1">
            AI-powered meal plans tailored to your goals and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              refetch();
              toast.success('Meal plans refreshed!', { duration: 2000 });
            }}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasMoreMealPlans && (
            <Button 
              onClick={() => {
                // TODO: Navigate to dedicated meal plans page
                console.log('Navigate to all meal plans');
              }}
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              View All ({allMealPlans.length})
            </Button>
          )}
          <Button 
            onClick={() => setShowCreator(true)} 
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Meal Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      {renderDashboardStats()}



      {/* Meal Plans List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Meal Plans</h2>
          {allMealPlans.length > 0 && (
            <span className="text-sm text-gray-500">
              {allMealPlans.length} total plans
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show creating meal plan card first if exists */}
              {renderCreatingMealPlanCard()}
              
              {/* Render existing meal plans */}
              {allMealPlans.length > 0 ? (
                <>
                  {dashboardMealPlans.map(renderMealPlanCard)}
                  
                  {/* View All Card */}
                  {hasMoreMealPlans && (
                    <Card 
                      key="view-all-meal-plans"
                      className="p-6 border-2 border-dashed border-indigo-300 cursor-pointer hover:shadow-lg transition-all duration-300 flex items-center justify-center min-h-[300px] group"
                      onClick={() => {
                        console.log('Navigate to all meal plans');
                      }}
                    >
                      <div className="text-center">
                        <ArrowRight className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          View All Plans
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {allMealPlans.length - maxDashboardMealPlans} more plans
                        </p>
                      </div>
                    </Card>
                  )}
                </>
              ) : !creatingMealPlan ? (
                <div className="col-span-full">
                  {renderEmptyState()}
                </div>
              ) : null}
            </div>


          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="p-4 h-auto justify-start"
            onClick={() => setShowCreator(true)}
          >
            <div className="flex items-center">
              <Plus className="w-6 h-6 mr-3 text-indigo-600" />
              <div className="text-left">
                <div className="font-medium">Create New Plan</div>
                <div className="text-sm text-gray-500">Start from scratch</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto justify-start"
            onClick={() => {
              // Implement template browsing
            }}
          >
            <div className="flex items-center">
              <Star className="w-6 h-6 mr-3 text-yellow-600" />
              <div className="text-left">
                <div className="font-medium">Browse Templates</div>
                <div className="text-sm text-gray-500">Use proven plans</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto justify-start"
            onClick={() => {
              // Implement nutrition analysis
            }}
          >
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Nutrition Analysis</div>
                <div className="text-sm text-gray-500">Track your progress</div>
              </div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(null)}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          icon={<Trash2 className="h-6 w-6" />}
        />
      )}
    </div>
  );
};