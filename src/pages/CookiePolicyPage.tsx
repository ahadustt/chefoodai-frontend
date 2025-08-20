import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cookie, Settings, Eye, BarChart, Target, Shield, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CookiePolicyPage() {
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true, // Always enabled
    analytics: true,
    marketing: false,
    preferences: true
  })

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const toggleCookie = (type: string) => {
    if (type === 'necessary') return // Cannot disable necessary cookies
    setCookieSettings(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }))
  }

  const cookieTypes = [
    {
      id: 'necessary',
      title: 'Strictly Necessary Cookies',
      icon: <Shield className="w-6 h-6" />,
      description: 'These cookies are essential for the website to function properly and cannot be disabled.',
      purpose: 'Authentication, security, basic functionality',
      retention: 'Session or up to 1 year',
      examples: ['Authentication tokens', 'Security preferences', 'Session management'],
      canToggle: false,
      enabled: cookieSettings.necessary
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      icon: <BarChart className="w-6 h-6" />,
      description: 'Help us understand how visitors interact with our website to improve user experience.',
      purpose: 'Website analytics, performance monitoring, user behavior analysis',
      retention: 'Up to 2 years',
      examples: ['Google Analytics', 'Page views tracking', 'Feature usage statistics'],
      canToggle: true,
      enabled: cookieSettings.analytics
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      icon: <Target className="w-6 h-6" />,
      description: 'Used to track visitors across websites to display relevant and engaging advertisements.',
      purpose: 'Personalized advertising, retargeting, marketing campaign optimization',
      retention: 'Up to 1 year',
      examples: ['Facebook Pixel', 'Google Ads', 'Retargeting pixels'],
      canToggle: true,
      enabled: cookieSettings.marketing
    },
    {
      id: 'preferences',
      title: 'Preference Cookies',
      icon: <Settings className="w-6 h-6" />,
      description: 'Remember your preferences and settings to provide a personalized experience.',
      purpose: 'Language preferences, theme selection, personalization settings',
      retention: 'Up to 1 year',
      examples: ['Language settings', 'Theme preferences', 'Dietary restrictions'],
      canToggle: true,
      enabled: cookieSettings.preferences
    }
  ]

  const thirdPartyCookies = [
    {
      name: 'Google Analytics',
      purpose: 'Website analytics and performance monitoring',
      retention: '2 years',
      privacy: 'https://policies.google.com/privacy'
    },
    {
      name: 'Google Ads',
      purpose: 'Advertising and conversion tracking',
      retention: '90 days - 2 years',
      privacy: 'https://policies.google.com/privacy'
    },
    {
      name: 'Facebook Pixel',
      purpose: 'Social media advertising and analytics',
      retention: '180 days',
      privacy: 'https://www.facebook.com/privacy/policy'
    },
    {
      name: 'Intercom',
      purpose: 'Customer support and messaging',
      retention: '1 year',
      privacy: 'https://www.intercom.com/legal/privacy'
    }
  ]

  const saveCookieSettings = () => {
    // In a real implementation, this would save settings to localStorage and update tracking
    localStorage.setItem('cookieConsent', JSON.stringify(cookieSettings))
    alert('Cookie preferences saved successfully!')
  }

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
            <Cookie className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Cookie 
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Policy</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Learn about how we use cookies to improve your experience on ChefoodAI™ and 
            how you can control your preferences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-500">
            <span>Last updated: January 10, 2025</span>
            <span className="hidden sm:inline">•</span>
            <span>Effective date: January 1, 2025</span>
          </div>
        </motion.div>
      </section>

      {/* Cookie Manager */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-blue-50 rounded-xl p-8 mb-12"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Cookie Preferences
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Manage your cookie preferences below. Changes will take effect immediately.
            </p>

            <div className="space-y-6">
              {cookieTypes.map((cookie, index) => (
                <motion.div
                  key={cookie.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-blue-600">
                          {cookie.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cookie.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {cookie.description}
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Purpose:</span>
                          <p className="text-gray-600 mt-1">{cookie.purpose}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Retention:</span>
                          <p className="text-gray-600 mt-1">{cookie.retention}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <span className="font-medium text-gray-700 text-sm">Examples:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cookie.examples.map((example, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <button
                        onClick={() => toggleCookie(cookie.id)}
                        disabled={!cookie.canToggle}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                          cookie.enabled
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        } ${
                          !cookie.canToggle 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:opacity-80 cursor-pointer'
                        }`}
                      >
                        {cookie.enabled ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                          {cookie.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </button>
                      {!cookie.canToggle && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Required
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button
                onClick={saveCookieSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
              >
                Save Preferences
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Are Cookies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What Are Cookies?
            </h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences, 
                keeping you logged in, and helping us understand how you use our site.
              </p>
              <p>
                We use both session cookies (which expire when you close your browser) and persistent cookies 
                (which remain on your device for a set period). Some cookies are essential for the website 
                to function, while others help us improve our services.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How We Use Cookies
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Essential Functionality
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Keep you logged in, remember your dietary preferences, and ensure the website works properly.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Performance Analytics
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Understand how you use our site to improve features and fix issues.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Personalization
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Customize your experience with personalized recipe recommendations and content.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Marketing & Advertising
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Show you relevant ads and measure the effectiveness of our marketing campaigns.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Third-Party Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Third-Party Cookies
            </h2>
            <p className="text-gray-600 mb-8">
              We work with trusted partners who may set cookies on our website to provide their services.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retention
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Privacy Policy
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {thirdPartyCookies.map((service, index) => (
                    <tr key={service.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {service.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {service.retention}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a 
                          href={service.privacy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          View Policy
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Managing Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Managing Your Cookies
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-6">
                You have several options for managing cookies:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <Eye className="w-5 h-5 inline mr-2 text-blue-600" />
                    Website Settings
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Use our cookie preference center above to control which types of cookies we use.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <Settings className="w-5 h-5 inline mr-2 text-blue-600" />
                    Browser Settings
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Configure your browser to block or delete cookies. Note that this may affect website functionality.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Disabling certain cookies may limit your ability to use some features of our website. 
                  Essential cookies cannot be disabled as they are necessary for the site to function.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-blue-50 rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions About Cookies?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have questions about our use of cookies or would like to update your preferences, 
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:privacy@chefoodai.com"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Email Privacy Team
              </a>
              <a 
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Contact Form
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
