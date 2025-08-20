import React, { useState } from 'react'
import { Info, HelpCircle } from 'lucide-react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
  triggerClassName?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className,
  triggerClassName
}) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={delayDuration}>
        <TooltipPrimitive.Trigger asChild className={triggerClassName}>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(
              'z-50 max-w-xs px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              className
            )}
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

interface NutritionTooltipProps {
  isCalculated?: boolean
  source?: 'usda' | 'ai' | 'estimated'
  className?: string
}

export const NutritionInfoTooltip: React.FC<NutritionTooltipProps> = ({ 
  isCalculated = true,
  source = 'usda',
  className 
}) => {
  const getTooltipContent = () => {
    switch (source) {
      case 'usda':
        return (
          <div className="space-y-2">
            <div className="font-semibold flex items-center gap-1">
              <Info className="h-3 w-3" />
              Nutrition Data Source
            </div>
            <p className="text-xs leading-relaxed">
              Calculated using the <strong>USDA FoodData Central</strong> database, 
              the official U.S. government nutrition database with lab-analyzed data 
              from over 1.5 million foods.
            </p>
            <p className="text-xs text-gray-300 italic">
              Same source used by MyFitnessPal & healthcare professionals
            </p>
          </div>
        )
      case 'ai':
        return (
          <div className="space-y-2">
            <div className="font-semibold flex items-center gap-1">
              <Info className="h-3 w-3" />
              AI-Generated Nutrition
            </div>
            <p className="text-xs leading-relaxed">
              Nutrition estimates provided by AI based on recipe analysis. 
              May vary from actual values.
            </p>
          </div>
        )
      case 'estimated':
        return (
          <div className="space-y-2">
            <div className="font-semibold flex items-center gap-1">
              <Info className="h-3 w-3" />
              Estimated Nutrition
            </div>
            <p className="text-xs leading-relaxed">
              Basic estimates based on typical serving sizes. 
              Actual nutrition may vary significantly.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Tooltip content={getTooltipContent()} side="top">
      <button className={cn(
        "inline-flex items-center justify-center w-4 h-4 rounded-full",
        "bg-blue-100 hover:bg-blue-200 transition-colors cursor-help",
        className
      )}>
        <Info className="h-3 w-3 text-blue-600" />
      </button>
    </Tooltip>
  )
}

interface MacroTooltipProps {
  macro: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sugar' | 'sodium'
  value: number
  dailyValue?: number
  className?: string
}

export const MacroTooltip: React.FC<MacroTooltipProps> = ({ 
  macro, 
  value, 
  dailyValue,
  className 
}) => {
  const getDailyValuePercentage = () => {
    if (!dailyValue) return null
    const percentage = Math.round((value / dailyValue) * 100)
    return `${percentage}% of daily value`
  }

  const getMacroInfo = () => {
    switch (macro) {
      case 'calories':
        return {
          description: 'Total energy content',
          dailyValue: 2000,
          unit: 'kcal'
        }
      case 'protein':
        return {
          description: 'Essential for muscle growth and repair',
          dailyValue: 50,
          unit: 'g',
          caloriesPerGram: 4
        }
      case 'carbs':
        return {
          description: 'Primary energy source for your body',
          dailyValue: 300,
          unit: 'g',
          caloriesPerGram: 4
        }
      case 'fat':
        return {
          description: 'Important for hormone production and vitamin absorption',
          dailyValue: 65,
          unit: 'g',
          caloriesPerGram: 9
        }
      case 'fiber':
        return {
          description: 'Aids digestion and promotes fullness',
          dailyValue: 25,
          unit: 'g'
        }
      case 'sugar':
        return {
          description: 'Simple carbohydrates for quick energy',
          dailyValue: 50,
          unit: 'g'
        }
      case 'sodium':
        return {
          description: 'Essential electrolyte, but limit intake',
          dailyValue: 2300,
          unit: 'mg'
        }
      default:
        return null
    }
  }

  const info = getMacroInfo()
  if (!info) return null

  const percentage = info.dailyValue ? Math.round((value / info.dailyValue) * 100) : null

  return (
    <Tooltip 
      content={
        <div className="space-y-2 min-w-[200px]">
          <div className="font-semibold capitalize">{macro}</div>
          <p className="text-xs leading-relaxed">{info.description}</p>
          {percentage !== null && (
            <div className="text-xs">
              <div className="flex justify-between">
                <span>Daily Value:</span>
                <span className="font-semibold">{percentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    percentage > 100 ? "bg-red-400" : 
                    percentage > 75 ? "bg-yellow-400" : 
                    "bg-green-400"
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
          {info.caloriesPerGram && (
            <p className="text-xs text-gray-300">
              {info.caloriesPerGram} calories per gram
            </p>
          )}
        </div>
      }
      side="top"
    >
      <div className={className}>
        {children}
      </div>
    </Tooltip>
  )
}