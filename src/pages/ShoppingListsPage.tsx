import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { ShoppingListDashboard, ShoppingListView, ShoppingListGenerator } from '@/components/shopping'
import { shoppingListApi, ShoppingList, UpdateShoppingListItemRequest } from '@/services/shoppingListApi'

type ViewMode = 'dashboard' | 'view' | 'generate' | 'edit'

export function ShoppingListsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null)
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<string | undefined>()
  
  const queryClient = useQueryClient()

  // Update shopping list item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ 
      shoppingListId, 
      itemId, 
      updates 
    }: { 
      shoppingListId: string
      itemId: string
      updates: UpdateShoppingListItemRequest
    }) => {
      return shoppingListApi.updateItem(shoppingListId, itemId, updates)
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
      if (selectedList) {
        queryClient.invalidateQueries({ queryKey: ['shopping-list', selectedList.id] })
      }
    },
    onError: (error: any) => {
      console.error('Failed to update item:', error)
      toast.error('Failed to update item')
    },
  })

  // Fetch specific shopping list when viewing
  const { data: currentList, isLoading: loadingList } = useQuery({
    queryKey: ['shopping-list', selectedList?.id],
    queryFn: () => selectedList ? shoppingListApi.getShoppingList(selectedList.id) : null,
    enabled: viewMode === 'view' && !!selectedList?.id,
    staleTime: 30 * 1000, // 30 seconds
  })

  const handleViewList = (list: ShoppingList) => {
    setSelectedList(list)
    setViewMode('view')
  }

  const handleEditList = (list: ShoppingList) => {
    setSelectedList(list)
    setViewMode('edit')
  }

  const handleCreateNew = () => {
    setSelectedList(null)
    setViewMode('generate')
  }

  const handleGenerateFromMealPlan = (mealPlanId?: string) => {
    setSelectedMealPlanId(mealPlanId)
    setViewMode('generate')
  }

  const handleItemToggle = async (itemId: string, isPurchased: boolean) => {
    if (!selectedList) return
    
    updateItemMutation.mutate({
      shoppingListId: selectedList.id,
      itemId,
      updates: { is_purchased: isPurchased }
    })
  }

  const handleItemUpdate = async (itemId: string, updates: UpdateShoppingListItemRequest) => {
    if (!selectedList) return
    
    updateItemMutation.mutate({
      shoppingListId: selectedList.id,
      itemId,
      updates
    })
  }

  const handleGeneratorComplete = (shoppingList: ShoppingList) => {
    setSelectedList(shoppingList)
    setViewMode('view')
    toast.success('Shopping list generated successfully!')
  }

  const handleBackToDashboard = () => {
    setSelectedList(null)
    setSelectedMealPlanId(undefined)
    setViewMode('dashboard')
  }

  const handleShare = () => {
    if (!selectedList) return
    
    // Create shareable URL
    const shareData = {
      title: selectedList.name,
      text: `Check out my shopping list: ${selectedList.name}`,
      url: `${window.location.origin}/shopping-lists/${selectedList.id}`
    }
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareData.url)
        toast.success('Shopping list URL copied to clipboard')
      })
    } else {
      navigator.clipboard.writeText(shareData.url)
      toast.success('Shopping list URL copied to clipboard')
    }
  }

  const handlePrint = () => {
    if (!selectedList) return
    
    // Create a print-friendly version
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const groupedItems = selectedList.items.reduce((groups, item) => {
      const category = item.category || 'other'
      if (!groups[category]) groups[category] = []
      groups[category].push(item)
      return groups
    }, {} as Record<string, typeof selectedList.items>)
    
    const printContent = `
      <html>
        <head>
          <title>${selectedList.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; margin-bottom: 10px; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; }
            .item-name { flex: 1; }
            .item-quantity { color: #666; margin-left: 10px; }
            .checkbox { width: 20px; height: 20px; border: 2px solid #333; margin-right: 15px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>${selectedList.name}</h1>
          <p><strong>Total Items:</strong> ${selectedList.total_items}</p>
          ${Object.entries(groupedItems).map(([category, items]) => `
            <h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            <ul>
              ${items.map(item => `
                <li>
                  <div class="checkbox"></div>
                  <span class="item-name">${item.ingredient_name}</span>
                  <span class="item-quantity">${item.quantity} ${item.unit}</span>
                </li>
              `).join('')}
            </ul>
          `).join('')}
        </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const renderViewContent = () => {
    if (loadingList) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    }
    
    if (!currentList) {
      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shopping list not found</h2>
          <p className="text-gray-600 mb-4">The shopping list you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={handleBackToDashboard}>
            Back to Shopping Lists
          </Button>
        </div>
      )
    }
    
    return (
      <ShoppingListView
        shoppingList={currentList}
        onItemToggle={handleItemToggle}
        onItemUpdate={handleItemUpdate}
        onShare={handleShare}
        onPrint={handlePrint}
        onEdit={() => handleEditList(currentList)}
        isUpdating={updateItemMutation.isPending}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="relative backdrop-blur-sm bg-white/40 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-6"
              >
                {/* Back Button */}
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="bg-white/60 border-white/20 hover:bg-white/80 backdrop-blur-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Smart Shopping Lists
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      Generate intelligent shopping lists from your meal plans
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {viewMode === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShoppingListDashboard
                onCreateNew={handleCreateNew}
                onGenerateFromMealPlan={() => handleGenerateFromMealPlan()}
                onViewList={handleViewList}
                onEditList={handleEditList}
              />
            </motion.div>
          )}

          {viewMode === 'view' && (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* View Page Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedList?.name || 'Shopping List'}</h1>
                  <p className="text-gray-600 mt-1">Review and manage your shopping items</p>
                </div>
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="bg-white/60 border-white/20 hover:bg-white/80 backdrop-blur-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lists
                </Button>
              </div>
              
              {renderViewContent()}
            </motion.div>
          )}

          {viewMode === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Generate Page Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Generate Shopping List</h1>
                  <p className="text-gray-600 mt-1">Create a smart shopping list from your meal plan</p>
                </div>
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="bg-white/60 border-white/20 hover:bg-white/80 backdrop-blur-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lists
                </Button>
              </div>
              
              <ShoppingListGenerator
                onGenerated={handleGeneratorComplete}
                onCancel={handleBackToDashboard}
                preselectedMealPlanId={selectedMealPlanId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}