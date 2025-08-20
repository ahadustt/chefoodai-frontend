import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ChefHat, Calendar, Heart, ShoppingCart } from 'lucide-react'

const features = [
  {
    icon: ChefHat,
    title: 'Recipe Generation',
    description: 'Describe any craving and our AI creates detailed recipes with ingredients, instructions, and cooking tips tailored to your preferences.'
  },
  {
    icon: Calendar,
    title: 'Smart Meal Planning',
    description: 'Generate complete weekly meal plans that balance nutrition, variety, and your schedule. Perfect portions for your family size.'
  },
  {
    icon: Heart,
    title: 'Nutrition Analysis',
    description: 'Every recipe includes detailed nutritional information, calorie counts, and macro breakdowns to support your health goals.'
  },
  {
    icon: ShoppingCart,
    title: 'Auto Shopping Lists',
    description: 'Instantly generate organized shopping lists from your meal plans. Sorted by store sections to make grocery runs effortless.'
  }
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" ref={ref} className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From cravings to complete meals - ChefoodAI™ handles every step of your culinary journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-6">
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
} 