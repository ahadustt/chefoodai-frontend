import { motion } from 'framer-motion'
import { 
  ChefHat, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  Heart,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navigationLinks = [
    {
      title: "Product",
      links: [
        { name: "AI Recipe Generator", href: "/register" },
        { name: "Meal Planning", href: "/register" },
        { name: "Nutrition Analysis", href: "/register" },
        { name: "Shopping Lists", href: "/register" }
      ]
    },
    {
      title: "Company", 
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Resources & Legal",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "GDPR", href: "/gdpr" }
      ]
    }
  ]



  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/chefoodai", color: "hover:text-sky-500" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/chefoodai", color: "hover:text-blue-600" }
  ]

  const contactInfo = [
    { icon: Mail, text: "hello@chefoodai.com", href: "mailto:hello@chefoodai.com" },
    { icon: Phone, text: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: MapPin, text: "San Francisco, CA", href: "https://maps.google.com/?q=San+Francisco,+CA" }
  ]

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-50" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative border-b border-white/10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl font-bold mb-3 text-white"
            >
              Stay Updated with <span className="text-chef-400">ChefoodAI™</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-blue-100 mb-6 max-w-xl mx-auto text-sm"
            >
              Get the latest recipes, cooking tips, and AI updates delivered to your inbox.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-chef-500 hover:bg-chef-600 text-white px-6 py-2 group">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <ChefHat className="h-7 w-7 text-chef-400" />
              </motion.div>
              <span className="text-xl font-bold text-white">ChefoodAI™</span>
            </div>

            <p className="text-blue-100 leading-relaxed max-w-md text-sm">
              Revolutionizing home cooking with AI-powered recipe generation and personalized meal planning.
            </p>

            {/* Contact Info - Compact */}
            <div className="space-y-2">
              {contactInfo.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.a
                    key={item.text}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-2 text-blue-100 hover:text-chef-400 transition-colors group text-sm"
                  >
                    <IconComponent className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    <span>{item.text}</span>
                  </motion.a>
                )
              })}
            </div>

            {/* Social Links - Compact */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/10 rounded-full text-blue-100 hover:text-white hover:bg-white/20 transition-all duration-300"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-3 w-3" />
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Navigation Links */}
          {navigationLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-white text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: linkIndex * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href={link.href}
                      className="text-blue-100 hover:text-chef-400 transition-colors duration-200 hover:translate-x-1 inline-block text-sm"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}


        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative border-t border-white/10 bg-black/20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-1 text-xs text-blue-100">
              <span>© {currentYear} ChefoodAI™. Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="h-3 w-3 text-red-400 fill-current" />
              </motion.div>
              <span>for food lovers everywhere.</span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs">
              <span className="text-blue-100">Powered by VouchCore™ AI</span>
              <motion.div
                className="h-1 w-1 bg-chef-400 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-blue-100">All rights reserved</span>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  )
} 