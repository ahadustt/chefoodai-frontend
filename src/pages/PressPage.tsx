import { motion } from 'framer-motion'
import { 
  Newspaper, 
  Download, 
  Camera, 
  FileText, 
  Mail, 
  Calendar, 
  Users, 
  Award, 
  TrendingUp,
  Globe,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Mic
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function PressPage() {
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

  const pressReleases = [
    {
      date: "January 15, 2025",
      title: "ChefoodAI™ Raises $50M Series B to Revolutionize AI-Powered Cooking",
      excerpt: "Leading venture capital firms invest in ChefoodAI™'s mission to make personalized cooking accessible to everyone through advanced AI technology.",
      category: "Funding",
      featured: true
    },
    {
      date: "December 10, 2024",
      title: "ChefoodAI™ Launches Revolutionary Imagen-Powered Recipe Visualization",
      excerpt: "New AI image generation feature creates stunning, personalized recipe photos that help users visualize their meals before cooking.",
      category: "Product",
      featured: true
    },
    {
      date: "November 22, 2024",
      title: "500,000 Users Create Over 2 Million AI-Generated Recipes",
      excerpt: "Platform reaches major milestone as home cooks worldwide embrace AI-powered meal planning and recipe generation.",
      category: "Milestone",
      featured: false
    },
    {
      date: "October 8, 2024",
      title: "ChefoodAI™ Partners with Whole Foods for Smart Shopping Integration",
      excerpt: "Strategic partnership enables seamless grocery shopping experience with AI-generated shopping lists and store integration.",
      category: "Partnership",
      featured: false
    },
    {
      date: "September 15, 2024",
      title: "ChefoodAI™ Wins 'Best AI Application' at TechCrunch Disrupt 2024",
      excerpt: "Recognition for innovative use of artificial intelligence in solving real-world cooking and nutrition challenges.",
      category: "Award",
      featured: false
    }
  ]

  const mediaKitAssets = [
    {
      category: "Logos & Brand Assets",
      icon: <ImageIcon className="w-6 h-6" />,
      items: [
        { name: "Primary Logo (PNG)", size: "2.1 MB", format: "PNG" },
        { name: "Logo Variations", size: "5.3 MB", format: "ZIP" },
        { name: "Brand Guidelines", size: "1.8 MB", format: "PDF" },
        { name: "Color Palette", size: "0.9 MB", format: "PDF" }
      ]
    },
    {
      category: "Product Screenshots",
      icon: <Camera className="w-6 h-6" />,
      items: [
        { name: "Dashboard Interface", size: "3.2 MB", format: "PNG" },
        { name: "Recipe Generation", size: "2.8 MB", format: "PNG" },
        { name: "Meal Planning View", size: "3.1 MB", format: "PNG" },
        { name: "Mobile App Screens", size: "8.4 MB", format: "ZIP" }
      ]
    },
    {
      category: "Team Photos",
      icon: <Users className="w-6 h-6" />,
      items: [
        { name: "Founder Headshots", size: "12.3 MB", format: "ZIP" },
        { name: "Team Group Photo", size: "4.7 MB", format: "JPG" },
        { name: "Office Photos", size: "15.2 MB", format: "ZIP" },
        { name: "Event Photos", size: "22.1 MB", format: "ZIP" }
      ]
    },
    {
      category: "Video Assets",
      icon: <Video className="w-6 h-6" />,
      items: [
        { name: "Product Demo Video", size: "85.2 MB", format: "MP4" },
        { name: "Founder Interview", size: "124.7 MB", format: "MP4" },
        { name: "Company Culture", size: "67.3 MB", format: "MP4" },
        { name: "Animation Assets", size: "45.8 MB", format: "ZIP" }
      ]
    }
  ]

  const mediaContact = {
    name: "Sarah Mitchell",
    title: "Head of Communications",
    email: "press@chefoodai.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/sarahmitchell",
    timezone: "PST (UTC-8)"
  }

  const companyFacts = [
    { label: "Founded", value: "2023" },
    { label: "Headquarters", value: "San Francisco, CA" },
    { label: "Employees", value: "50+" },
    { label: "Users", value: "500K+" },
    { label: "Recipes Generated", value: "2M+" },
    { label: "Countries", value: "150+" },
    { label: "Funding Raised", value: "$50M" },
    { label: "AI Models", value: "15+" }
  ]

  const awards = [
    {
      year: "2024",
      award: "Best AI Application",
      organization: "TechCrunch Disrupt",
      description: "Recognition for innovative AI-powered cooking platform"
    },
    {
      year: "2024",
      award: "FoodTech Innovation Award",
      organization: "Global Food Innovation Summit",
      description: "Outstanding contribution to food technology advancement"
    },
    {
      year: "2024",
      award: "Top 50 AI Companies",
      organization: "Forbes",
      description: "Listed among most promising AI startups"
    },
    {
      year: "2023",
      award: "Startup of the Year",
      organization: "Y Combinator",
      description: "Recognized for exceptional growth and innovation"
    }
  ]

  const recentCoverage = [
    {
      outlet: "TechCrunch",
      title: "ChefoodAI™'s Recipe for Success: $50M Series B",
      date: "Jan 16, 2025",
      author: "Alex Wilhelm",
      url: "#"
    },
    {
      outlet: "Forbes",
      title: "How AI is Transforming Home Cooking",
      date: "Jan 10, 2025",
      author: "Jennifer Castenson",
      url: "#"
    },
    {
      outlet: "The Wall Street Journal",
      title: "Food Tech's Next Big Bet: Personalized AI Chefs",
      date: "Dec 28, 2024",
      author: "Sarah Needleman",
      url: "#"
    },
    {
      outlet: "Wired",
      title: "The AI That Knows What You Want for Dinner",
      date: "Dec 15, 2024",
      author: "Lauren Goode",
      url: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-44 md:pt-52 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-chef-500/10 to-purple-600/10" />
        <motion.div 
          className="relative max-w-4xl mx-auto text-center"
          {...fadeInUp}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-chef-500 to-purple-600 rounded-full mb-8 shadow-xl"
          >
            <Newspaper className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Press & 
            <span className="bg-gradient-to-r from-chef-500 to-purple-600 bg-clip-text text-transparent"> Media</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The latest news, media resources, and press materials about ChefoodAI™'s mission 
            to revolutionize cooking through artificial intelligence.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              className="bg-chef-500 hover:bg-chef-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Download Media Kit
              <Download className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-chef-500 text-chef-600 hover:bg-chef-50 px-8 py-4 text-lg rounded-full"
            >
              Contact Press Team
              <Mail className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Key Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6"
          >
            {companyFacts.map((fact, index) => (
              <motion.div
                key={fact.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-chef-600 mb-2">
                  {fact.value}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  {fact.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Latest News & Announcements
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with our latest company news, product launches, and industry insights.
            </p>
          </motion.div>

          <div className="space-y-8">
            {pressReleases.map((release, index) => (
              <motion.article
                key={release.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                  release.featured ? 'border-chef-500' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <span className="text-sm text-gray-500 font-medium">
                      {release.date}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      release.category === 'Funding' ? 'bg-green-100 text-green-700' :
                      release.category === 'Product' ? 'bg-blue-100 text-blue-700' :
                      release.category === 'Award' ? 'bg-purple-100 text-purple-700' :
                      release.category === 'Partnership' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {release.category}
                    </span>
                    {release.featured && (
                      <span className="px-3 py-1 bg-chef-500 text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    size="sm"
                    variant="outline"
                    className="w-full lg:w-auto"
                  >
                    Read Full Release
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-chef-600 transition-colors cursor-pointer">
                  {release.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {release.excerpt}
                </p>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button 
              variant="outline"
              className="border-2 border-chef-500 text-chef-600 hover:bg-chef-50 px-8 py-3 rounded-lg"
            >
              View All Press Releases
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Media Kit */}
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
              Media Kit & Assets
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              High-resolution images, logos, and multimedia content for press and media use.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {mediaKitAssets.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="text-chef-500">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.category}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.size} • {item.format}
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 hover:text-chef-500 transition-colors" />
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-6 bg-chef-500 hover:bg-chef-600 text-white"
                >
                  Download All {category.category}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Coverage */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Recent Media Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what leading publications are saying about ChefoodAI™ and the future of cooking technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {recentCoverage.map((article, index) => (
              <motion.a
                key={article.title}
                href={article.url}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-chef-600">
                    {article.outlet}
                  </span>
                  <span className="text-sm text-gray-500">
                    {article.date}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-chef-600 transition-colors">
                  {article.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    By {article.author}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-chef-500 transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Awards & Recognition
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry recognition for our innovation in AI-powered cooking technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={award.award}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-chef-50 to-purple-50 rounded-xl p-6 border border-chef-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-chef-500 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-chef-600">
                        {award.year}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {award.award}
                    </h3>
                    
                    <p className="text-chef-700 font-medium text-sm mb-2">
                      {award.organization}
                    </p>
                    
                    <p className="text-gray-600 text-sm">
                      {award.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-20 bg-chef-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Media Inquiries
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            For press inquiries, interview requests, or media partnerships, please contact our communications team.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-white">
                  {mediaContact.name}
                </h3>
                <p className="text-white/80">
                  {mediaContact.title}
                </p>
              </div>
            </div>
            
            <div className="space-y-4 text-white/90">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${mediaContact.email}`} className="hover:text-white transition-colors">
                  {mediaContact.email}
                </a>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Mic className="w-4 h-4" />
                <a href={`tel:${mediaContact.phone}`} className="hover:text-white transition-colors">
                  {mediaContact.phone}
                </a>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{mediaContact.timezone}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                className="bg-white text-chef-600 hover:bg-gray-100 px-6 py-3 rounded-lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-chef-600 px-6 py-3 rounded-lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
