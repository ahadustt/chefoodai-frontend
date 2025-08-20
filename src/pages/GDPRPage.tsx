import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Mail, 
  Clock, 
  User, 
  Lock,
  Globe,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function GDPRPage() {
  const [requestForm, setRequestForm] = useState({
    type: 'access',
    email: '',
    subject: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setRequestForm({
        type: 'access',
        email: '',
        subject: '',
        description: ''
      })
    }, 3000)
  }

  const handleChange = (field: string, value: string) => {
    setRequestForm(prev => ({ ...prev, [field]: value }))
  }

  const dataRights = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Right of Access",
      description: "Request a copy of all personal data we hold about you",
      details: "You can request access to your personal data to see what information we have, how we use it, and who we share it with.",
      timeframe: "30 days",
      action: "Request Data Export"
    },
    {
      icon: <Edit className="w-8 h-8" />,
      title: "Right to Rectification",
      description: "Correct or update inaccurate personal information",
      details: "If you believe any of your personal data is inaccurate or incomplete, you can request that we correct or complete it.",
      timeframe: "30 days",
      action: "Request Correction"
    },
    {
      icon: <Trash2 className="w-8 h-8" />,
      title: "Right to Erasure",
      description: "Request deletion of your personal data",
      details: "Also known as the 'right to be forgotten', you can request deletion of your personal data in certain circumstances.",
      timeframe: "30 days",
      action: "Request Deletion"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Right to Restrict Processing",
      description: "Limit how we use your personal data",
      details: "You can request that we limit the processing of your personal data in certain circumstances.",
      timeframe: "30 days",
      action: "Request Restriction"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Right to Data Portability",
      description: "Transfer your data to another service",
      details: "You have the right to receive your personal data in a structured, commonly used format and transmit it to another controller.",
      timeframe: "30 days",
      action: "Request Export"
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: "Right to Object",
      description: "Object to certain types of data processing",
      details: "You can object to the processing of your personal data for direct marketing or other legitimate interests.",
      timeframe: "Immediate",
      action: "Submit Objection"
    }
  ]

  const dataCategories = [
    {
      category: "Account Information",
      data: ["Name", "Email address", "Password (encrypted)", "Profile picture"],
      purpose: "User authentication and account management",
      retention: "Until account deletion"
    },
    {
      category: "Cooking Preferences",
      data: ["Dietary restrictions", "Cuisine preferences", "Cooking skill level", "Health goals"],
      purpose: "Personalized recipe generation and meal planning",
      retention: "Until account deletion or user request"
    },
    {
      category: "Usage Data",
      data: ["Recipes generated", "Meal plans created", "Feature usage", "Session duration"],
      purpose: "Service improvement and analytics",
      retention: "24 months"
    },
    {
      category: "Communication Data",
      data: ["Support messages", "Email communications", "Feedback submissions"],
      purpose: "Customer support and service improvement",
      retention: "3 years"
    },
    {
      category: "Technical Data",
      data: ["IP address", "Browser type", "Device information", "Log files"],
      purpose: "Security, performance monitoring, and analytics",
      retention: "12 months"
    }
  ]

  const requestTypes = [
    { value: 'access', label: 'Data Access Request', icon: <Eye className="w-4 h-4" /> },
    { value: 'rectification', label: 'Data Correction', icon: <Edit className="w-4 h-4" /> },
    { value: 'erasure', label: 'Data Deletion', icon: <Trash2 className="w-4 h-4" /> },
    { value: 'restriction', label: 'Restrict Processing', icon: <Lock className="w-4 h-4" /> },
    { value: 'portability', label: 'Data Export', icon: <Download className="w-4 h-4" /> },
    { value: 'objection', label: 'Object to Processing', icon: <AlertCircle className="w-4 h-4" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-44 md:pt-52 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
        <motion.div 
          className="relative max-w-4xl mx-auto text-center"
          {...fadeInUp}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-8 shadow-xl"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Data 
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Rights</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Under GDPR, you have important rights regarding your personal data. Learn about these rights 
            and how to exercise them with ChefoodAI™.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Submit Data Request
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-full"
            >
              Download My Data
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">30 Days</div>
              <div className="text-gray-600 text-sm">Response Time</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
              <div className="text-gray-600 text-sm">Data Rights</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">Free</div>
              <div className="text-gray-600 text-sm">No Charge</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">27</div>
              <div className="text-gray-600 text-sm">EU Countries</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
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
              Your GDPR Rights
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The General Data Protection Regulation gives you important rights over your personal data. 
              Here's what you can do and how we support these rights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dataRights.map((right, index) => (
              <motion.div
                key={right.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="text-blue-500 mb-4">
                  {right.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {right.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {right.description}
                </p>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {right.details}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{right.timeframe}</span>
                  </div>
                </div>
                
                <Button 
                  size="sm"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {right.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data We Collect */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Data We Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparency is key to GDPR compliance. Here's exactly what data we collect, 
              why we need it, and how long we keep it.
            </p>
          </motion.div>

          <div className="space-y-6">
            {dataCategories.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
              >
                <div className="grid lg:grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.data.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Purpose</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {category.purpose}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Retention Period</h4>
                    <p className="text-gray-600 text-sm">
                      {category.retention}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Request Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Submit a Data Request
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Exercise your GDPR rights by submitting a request. We'll respond within 30 days 
              and verify your identity to protect your data.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-xl border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Request Type *
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {requestTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange('type', type.value)}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                        requestForm.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {type.icon}
                      <span className="font-medium text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={requestForm.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must match the email address associated with your ChefoodAI™ account
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <Input
                  type="text"
                  value={requestForm.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Brief description of your request"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide any additional context or specific requirements for your request..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Identity Verification Required</p>
                    <p>
                      To protect your privacy, we'll need to verify your identity before processing your request. 
                      We may ask for additional documentation to confirm you are the account holder.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Submitting Request...
                  </div>
                ) : isSubmitted ? (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Request Submitted Successfully!
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Submit Data Request
                  </div>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Process
            </h2>
            <p className="text-lg text-gray-600">
              Here's what happens after you submit a data request
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: "Request Received",
                  description: "We acknowledge receipt of your request within 24 hours",
                  timeframe: "24 hours"
                },
                {
                  step: 2,
                  title: "Identity Verification",
                  description: "We verify your identity to protect your privacy and security",
                  timeframe: "1-3 days"
                },
                {
                  step: 3,
                  title: "Request Processing",
                  description: "Our team reviews and processes your request according to GDPR requirements",
                  timeframe: "5-25 days"
                },
                {
                  step: 4,
                  title: "Response Delivered",
                  description: "We provide you with the requested information or confirm completion of your request",
                  timeframe: "Within 30 days"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative flex items-start"
                >
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.timeframe}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Need Help with Your Data Rights?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our Data Protection Officer is here to help you understand and exercise your rights. 
            Contact us if you have any questions about GDPR or data protection.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Mail className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm mb-3">Direct line to our Data Protection Officer</p>
              <a 
                href="mailto:dpo@chefoodai.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                dpo@chefoodai.com
              </a>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <User className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Contact Form</h3>
              <p className="text-gray-600 text-sm mb-3">Submit detailed privacy inquiries</p>
              <Button 
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
