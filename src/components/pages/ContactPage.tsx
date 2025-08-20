import { motion } from 'framer-motion'
import { Mail, MessageSquare, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactOptions = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch via email",
      value: "hello@chefoodai.com",
      action: "mailto:hello@chefoodai.com"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our team",
      value: "Available 9 AM - 6 PM EST",
      action: "#"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with support",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-chef-50/30 via-white to-chef-100/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-chef-200/40 to-chef-300/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-chef-100/30 to-chef-200/10 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative z-10 pt-44 md:pt-52 pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              Let's{' '}
              <span className="bg-gradient-to-r from-chef-500 to-chef-600 bg-clip-text text-transparent">
                talk
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a question, suggestion, or just want to say hello? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="p-8 bg-white/50 backdrop-blur-sm border-border/50">
                  <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What's this about?"
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more..."
                        required
                        rows={5}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chef-500 focus:border-chef-500 resize-none"
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full bg-chef-500 hover:bg-chef-600 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </Card>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-8"
              >
                {/* Contact Options */}
                <div className="space-y-4">
                  {contactOptions.map((option, index) => {
                    const IconComponent = option.icon
                    return (
                      <motion.div
                        key={option.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      >
                        <Card className="p-6 bg-white/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <a href={option.action} className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-chef-100 text-chef-600 rounded-lg flex items-center justify-center">
                                <IconComponent className="h-6 w-6" />
                              </div>
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-semibold text-foreground mb-1">{option.title}</h3>
                              <p className="text-muted-foreground text-sm mb-2">{option.description}</p>
                              <p className="text-chef-600 font-medium">{option.value}</p>
                            </div>
                          </a>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Additional Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-chef-50/50 to-white border-chef-200/50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-chef-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Support Hours</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                          <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                          <p>Sunday: Closed</p>
                        </div>
                        <p className="text-xs text-chef-600 mt-3">
                          We typically respond within 2 hours during business hours
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <Card className="p-6 bg-white/50 backdrop-blur-sm border-border/50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <MapPin className="h-6 w-6 text-chef-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Our Office</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>123 Culinary Street</p>
                          <p>Food District, NY 10001</p>
                          <p>United States</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 