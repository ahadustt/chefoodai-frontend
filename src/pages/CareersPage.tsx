import { motion } from 'framer-motion'
import { 
  Users, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Heart, 
  Zap, 
  Globe, 
  Coffee, 
  Laptop,
  ArrowRight,
  CheckCircle,
  Building,
  GraduationCap,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CareersPage() {
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

  const benefits = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness stipends"
    },
    {
      icon: <Laptop className="w-6 h-6" />,
      title: "Remote-First",
      description: "Work from anywhere with flexible hours and home office setup allowance"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Learning & Growth",
      description: "Annual learning budget, conference attendance, and career development programs"
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      title: "Work-Life Balance",
      description: "Unlimited PTO, parental leave, and sabbatical opportunities"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Competitive Compensation",
      description: "Market-leading salaries, equity participation, and performance bonuses"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Amazing Team",
      description: "Work with world-class talent in an inclusive, collaborative environment"
    }
  ]

  const jobOpenings = [
    {
      title: "Senior AI Engineer",
      department: "Engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      salary: "$180k - $250k",
      description: "Lead development of our next-generation recipe AI models and machine learning infrastructure.",
      requirements: ["5+ years ML experience", "Python, TensorFlow/PyTorch", "NLP expertise", "PhD preferred"],
      urgent: true
    },
    {
      title: "Full Stack Engineer",
      department: "Engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      salary: "$140k - $190k",
      description: "Build and scale our web platform, working across React frontend and Python backend.",
      requirements: ["4+ years full-stack experience", "React, TypeScript", "Python, FastAPI", "Cloud platforms"],
      urgent: false
    },
    {
      title: "Product Manager - AI",
      department: "Product",
      location: "Remote / San Francisco",
      type: "Full-time",
      salary: "$160k - $220k",
      description: "Drive product strategy and roadmap for our AI-powered cooking features.",
      requirements: ["5+ years product management", "AI/ML product experience", "B2C SaaS background", "Data-driven mindset"],
      urgent: true
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$130k - $180k",
      description: "Scale our infrastructure to serve millions of users with reliability and performance.",
      requirements: ["4+ years DevOps experience", "Kubernetes, Docker", "AWS/GCP", "Infrastructure as Code"],
      urgent: false
    },
    {
      title: "UX Designer",
      department: "Design",
      location: "Remote / San Francisco",
      type: "Full-time",
      salary: "$120k - $160k",
      description: "Design intuitive, delightful experiences for home cooks using AI-powered tools.",
      requirements: ["4+ years UX design", "B2C product experience", "Design systems", "User research skills"],
      urgent: false
    },
    {
      title: "Content Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      salary: "$90k - $130k",
      description: "Create compelling content that educates and engages our community of home cooks.",
      requirements: ["3+ years content marketing", "Food/cooking knowledge", "SEO expertise", "Video content creation"],
      urgent: false
    }
  ]

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Mission-Driven",
      description: "We're passionate about making cooking accessible and enjoyable for everyone."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Innovation First",
      description: "We push the boundaries of what's possible with AI and food technology."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Impact",
      description: "Our work touches millions of lives, improving how people eat and live."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Inclusive Culture",
      description: "We celebrate diversity and create an environment where everyone can thrive."
    }
  ]

  const perks = [
    "🏠 $2,000 home office setup budget",
    "🍳 Monthly meal kit delivery",
    "📚 $3,000 annual learning stipend",
    "🏖️ Unlimited vacation policy",
    "🏥 Premium health, dental, vision",
    "👶 16 weeks parental leave",
    "🧘 Mental health & wellness support",
    "📱 Latest tech equipment",
    "🎉 Team retreats & events",
    "💰 Equity in a fast-growing company"
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
            <Briefcase className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Join Our 
            <span className="bg-gradient-to-r from-chef-500 to-purple-600 bg-clip-text text-transparent"> Mission</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Help us revolutionize how the world cooks. We're building the future of AI-powered 
            culinary experiences, and we want you to be part of the journey.
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
              View Open Positions
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-chef-500 text-chef-600 hover:bg-chef-50 px-8 py-4 text-lg rounded-full"
            >
              Our Culture
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-chef-600 mb-2">50+</div>
              <div className="text-gray-600 text-sm">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chef-600 mb-2">$50M</div>
              <div className="text-gray-600 text-sm">Series B Funding</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chef-600 mb-2">500K+</div>
              <div className="text-gray-600 text-sm">Active Users</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
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
              The principles that guide how we work, innovate, and grow together.
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
                className="text-center"
              >
                <div className="text-chef-500 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
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

      {/* Benefits Section */}
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
              Why You'll Love Working Here
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer competitive benefits and create an environment where you can do your best work.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Benefits Cards */}
            <motion.div
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-6"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  variants={fadeInUp}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="text-chef-500 mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Perks List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                What We Offer
              </h3>
              <div className="space-y-4">
                {perks.map((perk, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{perk}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Job Openings */}
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
              Open Positions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our team and help shape the future of cooking technology.
            </p>
          </motion.div>

          <div className="space-y-6">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      {job.urgent && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                          Urgent
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-chef-100 text-chef-700 text-sm rounded-full"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <Button className="w-full lg:w-auto bg-chef-500 hover:bg-chef-600 text-white px-6 py-3 rounded-lg">
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 mb-6">
              Don't see a role that fits? We're always looking for exceptional talent.
            </p>
            <Button 
              variant="outline"
              className="border-2 border-chef-500 text-chef-600 hover:bg-chef-50 px-8 py-3 rounded-lg"
            >
              Send Us Your Resume
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-chef-500 to-purple-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Cook Up Something Amazing?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join us in building the future of cooking technology. Apply today and become part of our mission 
            to make cooking accessible, enjoyable, and personalized for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-white text-chef-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              View All Positions
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-chef-600 px-8 py-4 text-lg rounded-full"
            >
              Contact Recruiting
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
