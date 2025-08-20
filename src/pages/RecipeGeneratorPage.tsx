import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RecipeGeneratorForm } from '@/components/recipe/RecipeGeneratorForm'
import { RecipeDisplay } from '@/components/recipe/RecipeDisplay'
import { Recipe, checkBackendHealth } from '@/lib/api'

export function RecipeGeneratorPage() {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [backendStatus, setBackendStatus] = useState<{
    status: string
    ai_connected: boolean
  } | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(true)

  useEffect(() => {
    // Check backend health on page load
    const checkHealth = async () => {
      setIsCheckingHealth(true)
      try {
        const health = await checkBackendHealth()
        setBackendStatus(health)
      } catch (error) {
        setBackendStatus({ status: 'error', ai_connected: false })
      } finally {
        setIsCheckingHealth(false)
      }
    }

    checkHealth()
  }, [])

  const handleRecipeGenerated = (recipe: Recipe) => {
    setCurrentRecipe(recipe)
    // Scroll to recipe display
    setTimeout(() => {
      document.getElementById('recipe-display')?.scrollIntoView({ 
        behavior: 'smooth' 
      })
    }, 100)
  }

  const handleGenerateAnother = () => {
    setCurrentRecipe(null)
    // Scroll back to form
    setTimeout(() => {
      document.getElementById('recipe-form')?.scrollIntoView({ 
        behavior: 'smooth' 
      })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            AI Recipe Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Create personalized recipes instantly. Tell us your preferences,
          and we'll craft the perfect recipe just for you.
          </p>
        </motion.div>



        <div className="max-w-4xl mx-auto space-y-8">
          {/* Recipe Generator Form */}
          <motion.div
            id="recipe-form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RecipeGeneratorForm 
              onRecipeGenerated={handleRecipeGenerated}
              className="w-full"
            />
          </motion.div>

          {/* Recipe Display */}
          {currentRecipe && (
            <motion.div
              id="recipe-display"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <RecipeDisplay recipe={currentRecipe} className="w-full" />
              
              {/* Generate Another Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-8"
              >
                <Button
                  onClick={handleGenerateAnother}
                  variant="outline"
                  className="px-8 py-3"
                >
                  Generate Another Recipe
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 