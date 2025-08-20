import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Book, 
  MessageCircle, 
  Video, 
  HelpCircle,
  Star,
  Clock,
  User,
  ChefHat,
  Settings,
  CreditCard,
  Shield,
  Bot,
  Utensils
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const categories = [
    { id: 'all', name: 'All Topics', icon: <Book className="w-4 h-4" />, count: 45 },
    { id: 'getting-started', name: 'Getting Started', icon: <ChefHat className="w-4 h-4" />, count: 8 },
    { id: 'ai-features', name: 'AI Features', icon: <Bot className="w-4 h-4" />, count: 12 },
    { id: 'meal-planning', name: 'Meal Planning', icon: <Utensils className="w-4 h-4" />, count: 10 },
    { id: 'billing', name: 'Billing & Plans', icon: <CreditCard className="w-4 h-4" />, count: 7 },
    { id: 'account', name: 'Account Settings', icon: <Settings className="w-4 h-4" />, count: 5 },
    { id: 'privacy', name: 'Privacy & Security', icon: <Shield className="w-4 h-4" />, count: 3 }
  ]

  const quickLinks = [
    {
      title: "Getting Started Guide",
      description: "Complete walkthrough for new users",
      icon: <ChefHat className="w-6 h-6" />,
      time: "5 min read",
      popular: true
    },
    {
      title: "AI Recipe Generation",
      description: "How our AI creates personalized recipes",
      icon: <Bot className="w-6 h-6" />,
      time: "3 min read",
      popular: true
    },
    {
      title: "Meal Planning Basics",
      description: "Create your first meal plan",
      icon: <Utensils className="w-6 h-6" />,
      time: "4 min read",
      popular: false
    },
    {
      title: "Subscription Plans",
      description: "Compare features and pricing",
      icon: <CreditCard className="w-6 h-6" />,
      time: "2 min read",
      popular: true
    }
  ]

  const faqs = [
    {
      category: 'getting-started',
      question: "How do I create my first recipe with ChefoodAI™?",
      answer: "Creating your first recipe is easy! Simply click on 'Generate Recipe' in your dashboard, specify your dietary preferences, ingredients you have on hand, and any cooking constraints. Our AI will generate a personalized recipe just for you in seconds."
    },
    {
      category: 'getting-started',
      question: "What information should I include in my profile for better recommendations?",
      answer: "For the best experience, include your dietary restrictions, cooking skill level, preferred cuisines, common ingredients you have, and any health goals. The more information you provide, the better our AI can personalize your recipes and meal plans."
    },
    {
      category: 'ai-features',
      question: "How does ChefoodAI™'s recipe generation work?",
      answer: "Our AI uses advanced machine learning models trained on millions of recipes and cooking techniques. It considers your preferences, dietary needs, available ingredients, and cooking constraints to generate personalized recipes that are both delicious and nutritionally balanced."
    },
    {
      category: 'ai-features',
      question: "Can I trust the nutritional information provided by the AI?",
      answer: "Our AI provides approximate nutritional information based on standard ingredient databases. While we strive for accuracy, we recommend consulting with healthcare professionals for specific dietary needs and always double-checking nutritional content for critical health requirements."
    },
    {
      category: 'ai-features',
      question: "What if I don't like a recipe the AI generated?",
      answer: "No problem! You can regenerate recipes with different parameters, provide feedback to improve future suggestions, or manually edit recipes to your liking. Your feedback helps our AI learn your preferences better over time."
    },
    {
      category: 'meal-planning',
      question: "How do I create a weekly meal plan?",
      answer: "Go to the 'Meal Plans' section, click 'Create New Plan', and specify your preferences including family size, dietary restrictions, and budget. Our AI will generate a complete weekly meal plan with recipes, shopping lists, and nutritional information."
    },
    {
      category: 'meal-planning',
      question: "Can I modify generated meal plans?",
      answer: "Absolutely! You can swap out individual meals, adjust serving sizes, add or remove days, and even regenerate specific meals that don't appeal to you. Meal plans are fully customizable to fit your needs."
    },
    {
      category: 'meal-planning',
      question: "How does the shopping list feature work?",
      answer: "When you create a meal plan, we automatically generate an organized shopping list with all ingredients needed. The list is categorized by store sections (produce, dairy, etc.) and consolidates duplicate ingredients to save you time and money."
    },
    {
      category: 'billing',
      question: "What's included in the free plan?",
      answer: "The free plan includes 5 AI-generated recipes per month, basic meal planning for up to 3 days, and access to our recipe library. You can upgrade anytime for unlimited recipes, extended meal plans, and premium features."
    },
    {
      category: 'billing',
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period, and you'll continue to have access to premium features until then."
    },
    {
      category: 'billing',
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for new subscribers. If you're not satisfied with our service within the first 30 days, contact our support team for a full refund."
    },
    {
      category: 'account',
      question: "How do I update my dietary preferences?",
      answer: "Go to your account settings and click on 'Dietary Preferences'. You can update your restrictions, allergies, preferred cuisines, and cooking skill level. Changes will be applied to all future recipe generations immediately."
    },
    {
      category: 'account',
      question: "Can I export my saved recipes?",
      answer: "Yes! Pro users can export their saved recipes in various formats including PDF, CSV, or directly to popular recipe management apps. This feature is available in your recipe library."
    },
    {
      category: 'privacy',
      question: "How is my personal data protected?",
      answer: "We use industry-standard encryption and security measures to protect your data. We never sell your personal information, and you have full control over your data with options to export or delete it anytime."
    },
    {
      category: 'privacy',
      question: "Does ChefoodAI™ use my data to train AI models?",
      answer: "We only use anonymized, aggregated data to improve our AI models. Personal information and individual recipes are never used for training. You can opt out of data usage for AI improvement in your privacy settings."
    }
  ]

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs.filter(faq => faq.category === selectedCategory && faq.question.toLowerCase().includes(searchQuery.toLowerCase()))

  const tutorials = [
    {
      title: "Complete Beginner's Guide",
      description: "Everything you need to know to get started with ChefoodAI™",
      duration: "15 min",
      thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
      popular: true
    },
    {
      title: "Advanced AI Features",
      description: "Unlock the full potential of our AI recipe generation",
      duration: "12 min",
      thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
      popular: false
    },
    {
      title: "Meal Planning Masterclass",
      description: "Create perfect meal plans for any lifestyle",
      duration: "20 min",
      thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
      popular: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-44 md:pt-52 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-chef-500/10 to-blue-600/10" />
        <motion.div 
          className="relative max-w-4xl mx-auto text-center"
          {...fadeInUp}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-chef-500 to-blue-600 rounded-full mb-8 shadow-xl"
          >
            <HelpCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Help 
            <span className="bg-gradient-to-r from-chef-500 to-blue-600 bg-clip-text text-transparent"> Center</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Find answers to your questions, learn how to make the most of ChefoodAI™, 
            and get support when you need it.
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-chef-500 focus:ring-chef-500/20"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Articles
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to the most common questions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
              >
                {link.popular && (
                  <div className="absolute -top-2 -right-2 bg-chef-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </div>
                )}
                
                <div className="text-chef-500 mb-4 group-hover:scale-110 transition-transform duration-200">
                  {link.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {link.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {link.description}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {link.time}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1"
            >
              <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Browse by Category
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                        selectedCategory === category.id
                          ? 'bg-chef-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {category.icon}
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        selectedCategory === category.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Contact Support */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Need More Help?
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-3"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-600">
                  {filteredFAQs.length} articles found
                  {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                </p>
              </div>

              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      <div className="flex-shrink-0">
                        {expandedFAQ === index ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {expandedFAQ === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Video Tutorials
            </h2>
            <p className="text-lg text-gray-600">
              Learn visually with our step-by-step video guides
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group relative"
              >
                {tutorial.popular && (
                  <div className="absolute top-4 left-4 z-10 bg-chef-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </div>
                )}
                
                <div className="relative">
                  <img 
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {tutorial.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {tutorial.duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-20 bg-chef-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Our support team is available 24/7 to help you get the most out of ChefoodAI™.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <MessageCircle className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-white/80 mb-4">Chat with us in real-time</p>
              <Button className="w-full bg-white text-chef-600 hover:bg-gray-100">
                Start Chat
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <User className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-white/80 mb-4">Get detailed help via email</p>
              <Button className="w-full bg-white text-chef-600 hover:bg-gray-100">
                Send Email
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <Book className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-white/80 mb-4">Comprehensive guides</p>
              <Button className="w-full bg-white text-chef-600 hover:bg-gray-100">
                View Docs
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
