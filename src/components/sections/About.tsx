import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { CheckCircle } from 'lucide-react'

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const stats = [
    { number: "100K+", label: "Recipes Generated" },
    { number: "30s", label: "Average Time" },
    { number: "95%", label: "User Satisfaction" }
  ]

  return (
    <section id="about" className="py-20 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Stop wondering what to cook
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Our AI understands your preferences, dietary needs, and what you have available. 
              Just describe what you're craving, and get a perfect recipe instantly.
            </p>

            <div className="space-y-4">
              {[
                "Personalized to your taste and diet",
                "Works with ingredients you have",
                "Adapts to your cooking skill level"
              ].map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    ChefoodAI™ Assistant
                  </h3>
                  <p className="text-gray-600">Ready to help you cook</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-2">You say:</div>
                  <div className="text-gray-900 font-medium mb-4">
                    "I want something healthy with chicken and vegetables"
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">AI suggests:</div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        🍗
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Mediterranean Chicken Bowl</div>
                        <div className="text-sm text-gray-600">Ready in 25 minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 