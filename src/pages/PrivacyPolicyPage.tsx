import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, Globe, AlertCircle, Download, Trash2, Settings } from 'lucide-react'

export function PrivacyPolicyPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <Database className="w-5 h-5" />,
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an account, we collect your name, email address, and basic profile information to provide our services."
        },
        {
          subtitle: "Recipe & Cooking Data",
          text: "We collect information about your cooking preferences, dietary restrictions, saved recipes, meal plans, and cooking activity to personalize your experience."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about how you use our platform, including pages visited, features used, and interaction patterns."
        },
        {
          subtitle: "Device Information",
          text: "We may collect information about your device, including IP address, browser type, operating system, and mobile device identifiers."
        },
        {
          subtitle: "AI Training Data",
          text: "With your consent, we may use anonymized cooking data and feedback to improve our AI models and recipe generation capabilities."
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: <Settings className="w-5 h-5" />,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve ChefoodAI™ services, including personalized recipe generation and meal planning."
        },
        {
          subtitle: "AI Personalization",
          text: "Your dietary preferences and cooking history help our AI generate better, more personalized recipes and meal plans for you."
        },
        {
          subtitle: "Communication",
          text: "We may send you service-related communications, updates about new features, and promotional content (which you can opt out of)."
        },
        {
          subtitle: "Analytics & Improvement",
          text: "We analyze usage patterns to improve our platform, develop new features, and enhance user experience."
        },
        {
          subtitle: "Legal Compliance",
          text: "We may use your information to comply with legal obligations, resolve disputes, and enforce our agreements."
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing & Disclosure",
      icon: <Globe className="w-5 h-5" />,
      content: [
        {
          subtitle: "Third-Party Services",
          text: "We may share information with trusted third-party services that help us operate our platform, such as cloud hosting, analytics, and customer support tools."
        },
        {
          subtitle: "Business Transfers",
          text: "In case of merger, acquisition, or sale of assets, your information may be transferred as part of that transaction."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, to protect our rights, or to ensure user safety and platform security."
        },
        {
          subtitle: "Anonymized Data",
          text: "We may share aggregated, anonymized data for research, industry insights, or AI model improvement purposes."
        },
        {
          subtitle: "Your Consent",
          text: "We will not sell or share your personal information for marketing purposes without your explicit consent."
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security & Protection",
      icon: <Lock className="w-5 h-5" />,
      content: [
        {
          subtitle: "Encryption",
          text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption standards."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and authentication mechanisms to ensure only authorized personnel can access user data."
        },
        {
          subtitle: "Regular Audits",
          text: "Our security practices undergo regular audits and assessments to identify and address potential vulnerabilities."
        },
        {
          subtitle: "Data Minimization",
          text: "We collect and retain only the minimum amount of data necessary to provide our services effectively."
        },
        {
          subtitle: "Incident Response",
          text: "We have established procedures for detecting, responding to, and notifying users of any data security incidents."
        }
      ]
    },
    {
      id: "user-rights",
      title: "Your Rights & Choices",
      icon: <Eye className="w-5 h-5" />,
      content: [
        {
          subtitle: "Access & Portability",
          text: "You can access, download, and export your personal data at any time through your account settings or by contacting us."
        },
        {
          subtitle: "Correction & Updates",
          text: "You can update your personal information, preferences, and account settings directly through our platform."
        },
        {
          subtitle: "Data Deletion",
          text: "You can request deletion of your account and associated data. Some data may be retained for legal compliance or legitimate business purposes."
        },
        {
          subtitle: "Marketing Opt-out",
          text: "You can opt out of marketing communications at any time through email unsubscribe links or account settings."
        },
        {
          subtitle: "Cookie Management",
          text: "You can manage cookie preferences through your browser settings or our cookie preference center."
        }
      ]
    },
    {
      id: "ai-specific",
      title: "AI & Machine Learning",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        {
          subtitle: "AI Model Training",
          text: "We use anonymized and aggregated data to train and improve our AI models. Personal identifiers are removed before any AI training."
        },
        {
          subtitle: "Recipe Generation",
          text: "Our AI generates recipes based on your preferences and dietary requirements. Generated content is not stored as personal data."
        },
        {
          subtitle: "Bias Prevention",
          text: "We actively work to identify and mitigate bias in our AI systems to ensure fair and inclusive recipe recommendations."
        },
        {
          subtitle: "Human Oversight",
          text: "Our AI systems operate under human oversight, particularly for content moderation and quality assurance."
        },
        {
          subtitle: "Transparency",
          text: "We provide explanations for AI-generated recommendations and allow you to provide feedback to improve our systems."
        }
      ]
    }
  ]

  const complianceInfo = [
    {
      title: "GDPR Compliance (EU)",
      description: "We comply with the General Data Protection Regulation for all EU users.",
      features: ["Right to be forgotten", "Data portability", "Consent management", "Privacy by design"]
    },
    {
      title: "CCPA Compliance (California)",
      description: "We comply with the California Consumer Privacy Act for California residents.",
      features: ["Right to know", "Right to delete", "Right to opt-out", "Non-discrimination"]
    },
    {
      title: "SOC 2 Type II",
      description: "Our security controls are audited annually for compliance.",
      features: ["Security controls", "Availability", "Processing integrity", "Confidentiality"]
    }
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
            Privacy 
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Policy</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your privacy is fundamental to how we operate. This policy explains how we collect, 
            use, and protect your information when you use ChefoodAI™.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-500">
            <span>Last updated: January 10, 2025</span>
            <span className="hidden sm:inline">•</span>
            <span>Effective date: January 1, 2025</span>
          </div>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-blue-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Download Your Data</h3>
              <p className="text-sm text-gray-600">Export all your personal data in a portable format</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-green-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Settings className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Privacy Settings</h3>
              <p className="text-sm text-gray-600">Manage your privacy preferences and data sharing</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-red-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 rounded-xl p-6 mb-12"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {section.icon}
                  <span className="text-sm font-medium">{section.title}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Policy Sections */}
          <div className="space-y-16">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                className="scroll-mt-20"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="text-blue-600">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {item.subtitle}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Compliance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Compliance & Certifications
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {complianceInfo.map((compliance, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {compliance.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {compliance.description}
                  </p>
                  <ul className="space-y-2">
                    {compliance.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20 bg-blue-50 rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions About Your Privacy?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your data, 
              please don't hesitate to contact our privacy team.
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

          {/* Legal Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 p-6 bg-gray-100 rounded-lg text-sm text-gray-600"
          >
            <p className="mb-2">
              <strong>Changes to This Policy:</strong> We may update this Privacy Policy from time to time. 
              We will notify you of significant changes via email or through our platform.
            </p>
            <p>
              <strong>Effective Date:</strong> This policy is effective as of January 1, 2025, and applies to all users of ChefoodAI™ services.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
