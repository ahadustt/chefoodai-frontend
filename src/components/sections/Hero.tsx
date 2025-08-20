import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Hero() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const handleStartCooking = () => {
    navigate('/dashboard')
  }

  return (
    <section id="home" className="relative pt-44 md:pt-52 pb-32 md:pb-40 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
        
        {/* Floating Geometric Shapes */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" 
        />
        
        <motion.div 
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl blur-lg" 
        />
        
        <motion.div 
          animate={{ 
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/3 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-lg" 
        />
        
        {/* Gradient Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-3xl" 
        />
        
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-3xl" 
        />
        
        {/* Subtle Dot Pattern */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-300/40 rounded-full" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-300/40 rounded-full" />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-indigo-300/40 rounded-full" />
        
        {/* Modern Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50" />
      </div>

      <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Two-line Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight"
          >
            <span className="text-gray-900 block">Your Personal</span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block">
              AI Chef Awaits
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform any craving into a masterpiece. Get personalized recipes, smart meal plans, 
            and cooking guidance tailored exactly to your taste, dietary needs, and lifestyle—all powered by cutting-edge AI.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isLoggedIn ? (
              <Button
                onClick={handleStartCooking}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                Start Cooking Magic
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  Create My First Recipe
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
                
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="bg-white/70 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 px-8 py-4 text-base font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                >
                  See How It Works
                </Button>
              </>
            )}
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
} 