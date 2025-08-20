import { motion } from 'framer-motion'
import { Check, Crown, ChefHat, Zap, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export function PricingPage() {
  const navigate = useNavigate()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Free') {
      navigate('/register')
    } else {
      // For paid plans, navigate to register with plan parameter
      navigate('/register', { state: { plan: planName } })
    }
  }

  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "3 AI recipes per week",
        "Basic meal suggestions",
        "Simple shopping lists",
        "Community support"
      ],
      cta: "Start Free Today",
      popular: false,
      icon: ChefHat,
      gradient: "from-gray-500 to-gray-600"
    },
    {
      name: "Chef Pro",
      price: "$12",
      period: "per month",
      description: "For serious home cooks",
      features: [
        "Unlimited AI recipes",
        "Advanced meal planning",
        "Smart shopping lists",
        "Nutrition analysis",
        "Dietary customization",
        "Recipe collections",
        "Priority support"
      ],
      cta: "Start 14-Day Free Trial",
      popular: true,
      icon: Crown,
      gradient: "from-blue-600 to-purple-600"
    },
    {
      name: "Family Pro",
      price: "$19",
      period: "per month",
      description: "Built for busy families",
      features: [
        "Everything in Chef Pro",
        "Up to 6 family profiles",
        "Kid-friendly recipes",
        "Allergy management",
        "Family meal calendar",
        "Bulk meal prep guides",
        "Premium support"
      ],
      cta: "Start 14-Day Free Trial",
      popular: false,
      icon: Star,
      gradient: "from-emerald-600 to-teal-600"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Consolidated Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white pt-44 md:pt-52 pb-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, honest pricing
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Everything you need to cook smarter: AI-powered recipes, meal planning, nutrition tracking, and smart shopping lists - all in one place
            </p>
            
            {/* Value comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-blue-600 font-semibold mb-2">🍽️ Meal Planning</div>
                <div className="text-sm text-gray-600">Traditional: $60-100/month</div>
                <div className="text-sm font-medium text-gray-900">ChefoodAI™: Included</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-emerald-600 font-semibold mb-2">📊 Nutrition Analysis</div>
                <div className="text-sm text-gray-600">Traditional: $75-150/session</div>
                <div className="text-sm font-medium text-gray-900">ChefoodAI™: Included</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-purple-600 font-semibold mb-2">🛒 Smart Shopping</div>
                <div className="text-sm text-gray-600">Traditional: 15-25% markup</div>
                <div className="text-sm font-medium text-gray-900">ChefoodAI™: Save 20%+</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <p className="text-lg mb-4">Total traditional value: $200+ per month</p>
              <div className="text-4xl font-bold mb-2">Our plans start at $12/month</div>
              <p className="text-blue-100">Start free, upgrade when you're ready</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Pricing Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you're ready. All plans include our core AI features.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                        ⭐ Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className={`relative p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg h-full ${
                    plan.popular 
                      ? 'border-blue-200 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
                  }`}>
                    
                    {/* Plan header */}
                    <div className="text-center mb-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-r ${plan.gradient} text-white shadow-lg`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 ml-2 text-lg">/{plan.period}</span>
                      </div>
                      {plan.price !== "$0" && (
                        <p className="text-sm text-gray-500">14-day free trial included</p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button 
                      className={`w-full py-3 font-semibold rounded-lg transition-colors duration-200 ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                      onClick={() => handlePlanSelect(plan.name)}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Trust Indicators */}
          <div className="text-center mb-16">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-500" />
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="text-center">
            <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Questions?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Can I switch plans?</h4>
                  <p className="text-gray-600 text-sm">Yes, upgrade or downgrade anytime.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How does the trial work?</h4>
                  <p className="text-gray-600 text-sm">14 days free, no credit card required.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Need help?</h4>
                  <p className="text-gray-600 text-sm">Support included with all plans.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Is my data secure?</h4>
                  <p className="text-gray-600 text-sm">Enterprise-grade security guaranteed.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => navigate('/help')}
                >
                  More FAQs
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => navigate('/contact')}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 