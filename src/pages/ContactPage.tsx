import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Headphones, 
  FileText,
  Users,
  Building,
  Globe,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    category: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        category: 'general',
        message: ''
      })
    }, 3000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Get help from our support team",
      value: "hello@chefoodai.com",
      action: "mailto:hello@chefoodai.com",
      response: "Usually responds within 2 hours"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567",
      response: "Mon-Fri, 9AM-6PM PST"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with us in real-time",
      value: "Available 24/7",
      action: "#",
      response: "Average response: 30 seconds"
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Premium Support",
      description: "Priority support for Pro users",
      value: "Dedicated line",
      action: "tel:+15551234568",
      response: "15 minute SLA guarantee"
    }
  ]

  const officeLocations = [
    {
      city: "San Francisco",
      address: "123 Innovation Drive, Suite 400",
      zipcode: "San Francisco, CA 94107",
      isPrimary: true
    },
    {
      city: "New York",
      address: "456 Tech Avenue, Floor 15",
      zipcode: "New York, NY 10013",
      isPrimary: false
    },
    {
      city: "London",
      address: "789 Culinary Street, Level 8",
      zipcode: "London, UK EC2A 3AY",
      isPrimary: false
    }
  ]

  const departmentContacts = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Sales & Partnerships",
      email: "sales@chefoodai.com",
      description: "Business inquiries and partnership opportunities"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Press & Media",
      email: "press@chefoodai.com",
      description: "Media inquiries and press kit requests"
    },
    {
      icon: <Building className="w-5 h-5" />,
      title: "Careers",
      email: "careers@chefoodai.com",
      description: "Job applications and talent acquisition"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Legal & Privacy",
      email: "legal@chefoodai.com",
      description: "Legal matters and privacy concerns"
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
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Get in 
            <span className="bg-gradient-to-r from-chef-500 to-blue-600 bg-clip-text text-transparent"> Touch</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're here to help you succeed with ChefoodAI™. Whether you have questions, need support, 
            or want to explore partnerships, we'd love to hear from you.
          </p>
        </motion.div>
      </section>

      {/* Contact Methods Grid */}
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
              Choose How to Reach Us
            </h2>
            <p className="text-lg text-gray-600">
              Multiple ways to get the help you need, when you need it
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.title}
                href={method.action}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="text-chef-500 mb-4 group-hover:scale-110 transition-transform duration-200">
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {method.description}
                </p>
                <p className="text-chef-600 font-medium mb-2">
                  {method.value}
                </p>
                <p className="text-xs text-gray-500">
                  {method.response}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company (Optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      placeholder="Your company name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chef-500 focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="sales">Sales & Partnerships</option>
                      <option value="press">Press & Media</option>
                      <option value="careers">Careers</option>
                      <option value="feedback">Product Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="Brief description of your inquiry"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Tell us more about how we can help you..."
                    required
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chef-500 focus:border-transparent resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className="w-full bg-chef-500 hover:bg-chef-600 text-white py-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Sending Message...
                    </div>
                  ) : isSubmitted ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Message Sent Successfully!
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Office Hours */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-chef-500 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-chef-600 font-medium">
                      Emergency support available 24/7 for Pro users
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Locations */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 text-chef-500 mr-3" />
                  Our Offices
                </h3>
                <div className="space-y-4">
                  {officeLocations.map((office, index) => (
                    <div 
                      key={office.city}
                      className={`p-4 rounded-lg border-2 ${
                        office.isPrimary 
                          ? 'border-chef-200 bg-chef-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {office.city}
                        </h4>
                        {office.isPrimary && (
                          <span className="px-2 py-1 bg-chef-500 text-white text-xs rounded-full">
                            HQ
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {office.address}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {office.zipcode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Contacts */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Department Contacts
                </h3>
                <div className="space-y-3">
                  {departmentContacts.map((dept, index) => (
                    <div key={dept.title} className="flex items-start space-x-3">
                      <div className="text-chef-500 mt-1">
                        {dept.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {dept.title}
                        </h4>
                        <a 
                          href={`mailto:${dept.email}`}
                          className="text-chef-600 hover:text-chef-700 text-sm font-medium"
                        >
                          {dept.email}
                        </a>
                        <p className="text-gray-600 text-xs mt-1">
                          {dept.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "How quickly do you respond to support requests?",
                answer: "We typically respond to email inquiries within 2 hours during business hours. Live chat gets responses within 30 seconds, and phone support is available during business hours."
              },
              {
                question: "Do you offer enterprise or bulk pricing?",
                answer: "Yes! We offer custom enterprise solutions and bulk pricing for teams, schools, and organizations. Contact our sales team at sales@chefoodai.com for a personalized quote."
              },
              {
                question: "Can I schedule a demo of ChefoodAI™?",
                answer: "Absolutely! We'd love to show you how ChefoodAI™ can transform your cooking experience. Use the contact form above or email sales@chefoodai.com to schedule a personalized demo."
              },
              {
                question: "Where can I find your API documentation?",
                answer: "Our comprehensive API documentation is available at docs.chefoodai.com. For API access and technical integration support, contact our technical team."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
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
            <p className="text-gray-600 mb-4">
              Still have questions? We're here to help!
            </p>
            <Button className="bg-chef-500 hover:bg-chef-600 text-white px-6 py-3 rounded-lg">
              Visit Help Center
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
