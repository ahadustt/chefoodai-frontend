import { motion } from 'framer-motion'
import { ChefHat, Users, Award, Lightbulb, Heart, Globe, ArrowRight, Zap, Shield, Sparkles, Code, Brain, Rocket, Star, Coffee, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import ImageWithFallback from '@/components/ImageWithFallback'

export function AboutUsPage() {
  const navigate = useNavigate()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const teamMembers = [
    {
      name: "Ahadu Tilahun",
      role: "Founder & CEO",
      bio: "Visionary entrepreneur and tech innovator who founded ChefoodAI™ to democratize personalized cooking through AI. Leading the company's global expansion while driving innovation in intelligent food technology and AI strategy.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format",
      expertise: ["Leadership", "Vision", "AI Strategy", "Business Development", "Product Strategy"],
      highlight: true,
      icon: <Rocket className="w-5 h-5" />,
      achievements: ["Forbes 30 Under 30", "TechCrunch Disrupt Winner", "Global CEO"]
    },
    {
      name: "Marcus Rodriguez",
      role: "Co-Founder & CTO",
      bio: "Ex-Tesla AI engineer and culinary school graduate who bridges technology with authentic cooking. Architecting the future of food AI.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format",
      expertise: ["AI Engineering", "Culinary Arts", "System Architecture"],
      icon: <Code className="w-5 h-5" />,
      achievements: ["Tesla AI Engineer", "Le Cordon Bleu Graduate"]
    },
    {
      name: "Chef Isabella Laurent",
      role: "Head of Culinary Innovation",
      bio: "Michelin-starred chef and cookbook author specializing in global fusion and nutritional optimization. Creating the future of personalized cuisine.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format",
      expertise: ["Recipe Development", "Global Cuisine", "Nutrition"],
      icon: <ChefHat className="w-5 h-5" />,
      achievements: ["Michelin Star", "James Beard Award"]
    },
    {
      name: "Dr. Ahmed Hassan",
      role: "Head of AI Research",
      bio: "PhD in Computer Science from MIT, former OpenAI researcher focused on multimodal AI and food science. Advancing the science of taste prediction.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face&auto=format",
      expertise: ["Machine Learning", "Computer Vision", "NLP"],
      icon: <Target className="w-5 h-5" />,
      achievements: ["MIT PhD", "OpenAI Research"]
    },
    {
      name: "Elena Kowalski",
      role: "Head of Design & UX",
      bio: "Former Airbnb design lead passionate about creating intuitive, delightful cooking experiences. Making AI accessible to everyone.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face&auto=format",
      expertise: ["UX Design", "Product Design", "User Research"],
      icon: <Sparkles className="w-5 h-5" />,
      achievements: ["Airbnb Design Lead", "IXDA Award Winner"]
    }
  ]

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Health First",
      description: "Every recipe is crafted with nutritional balance and wellness at its core."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Accessibility",
      description: "Making quality nutrition and cooking accessible to everyone, everywhere."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "Pioneering the future of cooking with cutting-edge AI technology."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Safety",
      description: "Ensuring every recommendation is safe, tested, and scientifically sound."
    }
  ]

  const stats = [
    { number: "2M+", label: "Recipes Generated" },
    { number: "500K+", label: "Active Users" },
    { number: "150+", label: "Countries Served" },
    { number: "98%", label: "User Satisfaction" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-44 md:pt-52 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-chef-500/10 to-blue-600/10" />
        <motion.div 
          className="relative max-w-7xl mx-auto text-center"
          {...fadeInUp}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-chef-500 to-chef-600 rounded-full mb-8 shadow-xl"
          >
            <ChefHat className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Revolutionizing 
            <span className="bg-gradient-to-r from-chef-500 to-blue-600 bg-clip-text text-transparent"> Home Cooking</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make personalized, nutritious cooking accessible to everyone through 
            the power of artificial intelligence and culinary expertise.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              onClick={() => navigate('/register')}
              className="bg-chef-500 hover:bg-chef-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Cooking with AI
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="border-2 border-chef-500 text-chef-600 hover:bg-chef-50 px-8 py-4 text-lg rounded-full"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-chef-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  ChefoodAI™ was born from a simple yet powerful observation: despite having access to millions of recipes online, 
                  people still struggle with meal planning, nutrition, and cooking confidence.
                </p>
                <p>
                  Our founders, coming from backgrounds in AI research and culinary arts, recognized that technology could solve 
                  this fundamental challenge. By combining advanced machine learning with deep culinary knowledge, we created 
                  an AI that doesn't just suggest recipes—it understands your needs, preferences, and goals.
                </p>
                <p>
                  Today, ChefoodAI™ serves over 500,000 home cooks worldwide, generating personalized recipes that are both 
                  delicious and nutritionally optimized. We're not just changing how people cook; we're improving how they eat and live.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback 
                  src="https://picsum.photos/seed/modern-kitchen/600/400"
                  alt="Modern kitchen with AI technology"
                  title="Modern kitchen with AI technology"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-chef-500/20 to-transparent" />
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-xl"
              >
                <Zap className="w-8 h-8 text-yellow-500" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl"
              >
                <Sparkles className="w-8 h-8 text-chef-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do, from product development to customer service.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-chef-500 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-chef-100 text-chef-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              <span>Meet Our Visionaries</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              The Minds Behind
              <span className="bg-gradient-to-r from-chef-500 to-blue-600 bg-clip-text text-transparent"> ChefoodAI™</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              World-class innovators, engineers, and culinary artists united by a shared vision: 
              making personalized, intelligent cooking accessible to everyone, everywhere.
            </p>
          </motion.div>

          {/* Founder Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-chef-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                    >
                      <Rocket className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm font-medium text-white/90">Founder Spotlight</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold mb-3">
                    Ahadu Tilahun
                  </h3>
                  <p className="text-xl font-medium mb-4 text-white/90">
                    Founder & CEO
                  </p>
                  <p className="text-lg leading-relaxed mb-6 text-white/80">
                    The visionary entrepreneur who founded ChefoodAI™ to democratize personalized cooking through AI. 
                    Leading the company's global expansion while driving innovation in intelligent food technology and AI strategy.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {["Leadership", "Vision", "AI Strategy", "Business Development", "Product Strategy"].map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-white/20 text-white text-sm rounded-full font-medium backdrop-blur-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-300" />
                      <span className="text-sm font-medium">Forbes 30 Under 30</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-300" />
                      <span className="text-sm font-medium">Global CEO</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                  >
                    <div className="w-80 h-80 mx-auto relative">
                      <ImageWithFallback 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format"
                        alt="Ahadu Tilahun"
                        title="Ahadu Tilahun"
                        className="w-full h-full object-cover rounded-2xl shadow-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                      
                      {/* Floating badges */}
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-xl"
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">🚀</div>
                          <div className="text-xs font-bold text-gray-800">Innovator</div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                        className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-xl"
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">🎯</div>
                          <div className="text-xs font-bold text-gray-800">Visionary</div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rest of Team */}
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {teamMembers.slice(1).map((member, index) => (
              <motion.div
                key={member.name}
                variants={fadeInUp}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-100"
              >
                <div className="relative overflow-hidden">
                  <ImageWithFallback 
                    src={member.image}
                    alt={member.name}
                    title={member.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Role Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-chef-600 shadow-lg"
                  >
                    {member.icon}
                  </motion.div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-chef-600 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                  
                  {/* Achievements */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.achievements.map((achievement, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gradient-to-r from-chef-100 to-blue-100 text-chef-700 text-xs rounded-full font-medium"
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                  
                  {/* Expertise */}
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Team Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-chef-600 mb-2">5</div>
                  <div className="text-gray-600 text-sm font-medium">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chef-600 mb-2">40+</div>
                  <div className="text-gray-600 text-sm font-medium">Years Combined Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chef-600 mb-2">12+</div>
                  <div className="text-gray-600 text-sm font-medium">Awards & Recognition</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chef-600 mb-2">3</div>
                  <div className="text-gray-600 text-sm font-medium">Countries Represented</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-chef-500 to-blue-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join hundreds of thousands of home cooks who are already creating amazing meals with ChefoodAI™.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/register')}
              className="bg-white text-chef-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white hover:bg-white hover:text-chef-600 px-8 py-4 text-lg rounded-full"
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
