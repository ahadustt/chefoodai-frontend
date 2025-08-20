/**
 * ShoppingListDashboard Component
 * Main dashboard for managing shopping lists
 */
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Plus,
  ShoppingCart,
  Package,
  DollarSign,
  Calendar,
  Clock,
  Filter,
  Search,
  Grid,
  List,
  RefreshCw,
  Download,
  Sparkles,
  MoreVertical,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { 
  shoppingListApi, 
  ShoppingList, 
  ShoppingListStatus,
  ShoppingListFilters 
} from '../../services/shoppingListApi';

interface ShoppingListDashboardProps {
  onCreateNew?: () => void;
  onGenerateFromMealPlan?: () => void;
  onViewList?: (list: ShoppingList) => void;
  onEditList?: (list: ShoppingList) => void;
  className?: string;
}

export const ShoppingListDashboard: React.FC<ShoppingListDashboardProps> = ({
  onCreateNew,
  onGenerateFromMealPlan,
  onViewList,
  onEditList,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShoppingListStatus | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch shopping lists
  const { data: shoppingLists = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['shopping-lists', statusFilter],
    queryFn: async () => {
      const filters: ShoppingListFilters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter as ShoppingListStatus;
      }
      return shoppingListApi.getShoppingLists(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter lists based on search term
  const filteredLists = shoppingLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteList = async (listId: string) => {
    try {
      await shoppingListApi.deleteShoppingList(listId);
      toast.success('Shopping list deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete shopping list:', error);
      toast.error('Failed to delete shopping list');
      setDeleteConfirmId(null);
    }
  };

  const getStatusBadge = (status: ShoppingListStatus) => {
    const configs = {
      [ShoppingListStatus.DRAFT]: { 
        color: 'bg-gray-100 text-gray-700', 
        icon: Edit3,
        label: 'Draft'
      },
      [ShoppingListStatus.ACTIVE]: { 
        color: 'bg-blue-100 text-blue-700', 
        icon: ShoppingCart,
        label: 'Active'
      },
      [ShoppingListStatus.SHOPPING]: { 
        color: 'bg-orange-100 text-orange-700', 
        icon: Package,
        label: 'Shopping'
      },
      [ShoppingListStatus.COMPLETED]: { 
        color: 'bg-green-100 text-green-700', 
        icon: CheckCircle,
        label: 'Completed'
      },
      [ShoppingListStatus.ARCHIVED]: { 
        color: 'bg-purple-100 text-purple-700', 
        icon: Package,
        label: 'Archived'
      }
    };
    
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLists.map((list, index) => (
        <motion.div
          key={list.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-chef-600 transition-colors line-clamp-2">
                  {list.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(list.status)}
                  {list.meal_plan_id && (
                    <span className="px-2 py-1 bg-chef-100 text-chef-700 text-xs rounded-full">
                      From Meal Plan
                    </span>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle menu
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>{list.purchased_items} of {list.total_items} items</span>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-1">
                  <motion.div 
                    className="bg-chef-500 h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${list.total_items > 0 ? (list.purchased_items / list.total_items) * 100 : 0}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              
              {list.total_estimated_cost && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>~${list.total_estimated_cost.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Updated {format(new Date(list.updated_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewList?.(list);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditList?.(list);
                }}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmId(list.id);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredLists.map((list, index) => (
        <motion.div
          key={list.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-chef-600 transition-colors">
                      {list.name}
                    </h3>
                    {getStatusBadge(list.status)}
                    {list.meal_plan_id && (
                      <span className="px-2 py-1 bg-chef-100 text-chef-700 text-xs rounded-full">
                        From Meal Plan
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{list.purchased_items} of {list.total_items} items</span>
                    </div>
                    
                    {list.total_estimated_cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>~${list.total_estimated_cost.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated {format(new Date(list.updated_at), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-chef-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${list.total_items > 0 ? (list.purchased_items / list.total_items) * 100 : 0}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-10 text-right">
                    {list.total_items > 0 ? Math.round((list.purchased_items / list.total_items) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewList?.(list);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditList?.(list);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(list.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load shopping lists</h3>
        <p className="text-gray-600 mb-4">Something went wrong while fetching your shopping lists.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Lists</h1>
          <p className="text-gray-600 mt-1">
            Manage your shopping lists and track your grocery trips
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onGenerateFromMealPlan}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate from Meal Plan
          </Button>
          <Button
            onClick={onCreateNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New List
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search shopping lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ShoppingListStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-chef-500 focus:border-chef-500"
            >
              <option value="all">All Status</option>
              <option value={ShoppingListStatus.DRAFT}>Draft</option>
              <option value={ShoppingListStatus.ACTIVE}>Active</option>
              <option value={ShoppingListStatus.SHOPPING}>Shopping</option>
              <option value={ShoppingListStatus.COMPLETED}>Completed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : filteredLists.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching shopping lists' : 'No shopping lists yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search or filters'
              : 'Create your first shopping list or generate one from a meal plan'
            }
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={onCreateNew} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create New List
            </Button>
            <Button onClick={onGenerateFromMealPlan}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate from Meal Plan
            </Button>
          </div>
        </Card>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteList(deleteConfirmId)}
        title="Delete Shopping List"
        message="Are you sure you want to delete this shopping list? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
};
