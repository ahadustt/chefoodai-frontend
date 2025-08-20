import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { SavedRecipesProvider } from '@/contexts/SavedRecipesContext'
import { queryClient } from '@/lib/query-client'
import { Navbar } from '@/components/navigation/Navbar'
import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { About } from '@/components/sections/About'
import { Testimonials } from '@/components/sections/Testimonials'
import { Footer } from '@/components/sections/Footer'
import { RecipeGeneratorPage } from '@/pages/RecipeGeneratorPage'
import { MealPlansPage } from '@/pages/MealPlansPage'
import { AboutUsPage } from '@/pages/AboutUsPage'
import { ContactPage } from '@/pages/ContactPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/pages/TermsOfServicePage'
import { HelpCenterPage } from '@/pages/HelpCenterPage'
import { CareersPage } from '@/pages/CareersPage'
import { CookiePolicyPage } from '@/pages/CookiePolicyPage'
import { GDPRPage } from '@/pages/GDPRPage'
import { PressPage } from '@/pages/PressPage'
import { AccountProfilePage } from '@/pages/AccountProfilePage'
import { MyRecipesPage } from '@/pages/MyRecipesPage'
import { ShoppingListsPage } from '@/pages/ShoppingListsPage'
import { PricingPage } from '@/components/pages/PricingPage'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { motion } from 'framer-motion'
import { ChefHat } from 'lucide-react'
import { CookingAnimation } from '@/components/animations/CookingAnimations'
import '@/styles/globals.css'

function HomePage() {
  return (
    <main className="relative">
      <Hero />
      <Features />
      <About />
      <Testimonials />
    </main>
  )
}

function PricingPageWrapper() {
  return (
    <main className="relative">
      <PricingPage />
    </main>
  )
}

function ContactPageWrapper() {
  return (
    <main className="relative">
      <ContactPage />
    </main>
  )
}

function AboutUsPageWrapper() {
  return (
    <main className="relative">
      <AboutUsPage />
    </main>
  )
}

function PrivacyPolicyPageWrapper() {
  return (
    <main className="relative">
      <PrivacyPolicyPage />
    </main>
  )
}

function TermsOfServicePageWrapper() {
  return (
    <main className="relative">
      <TermsOfServicePage />
    </main>
  )
}

function HelpCenterPageWrapper() {
  return (
    <main className="relative">
      <HelpCenterPage />
    </main>
  )
}

function CareersPageWrapper() {
  return (
    <main className="relative">
      <CareersPage />
    </main>
  )
}

function CookiePolicyPageWrapper() {
  return (
    <main className="relative">
      <CookiePolicyPage />
    </main>
  )
}

function GDPRPageWrapper() {
  return (
    <main className="relative">
      <GDPRPage />
    </main>
  )
}

function PressPageWrapper() {
  return (
    <main className="relative">
      <PressPage />
    </main>
  )
}

// Layout component that conditionally shows navbar and footer
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  
  // Don't show navbar on login/register pages
  const hideNavbar = ['/login', '/register'].includes(location.pathname)
  
  // Show footer only on public pages
  const showFooter = ['/', '/pricing', '/contact', '/about', '/privacy', '/terms', '/help', '/careers', '/cookies', '/gdpr', '/press'].includes(location.pathname)
  
  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      {children}
      {showFooter && <Footer />}
    </div>
  )
}

// Component that handles global authentication loading
function AppContent() {
  const { loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-chef-50/30 via-white to-chef-100/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-chef-400/30 to-chef-600/20 blur-xl animate-pulse"></div>
            <div className="relative flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-chef-500 to-chef-700 mb-8 shadow-2xl shadow-chef-500/40 mx-auto border-4 border-white/20">
              {/* Clean spinner instead of cooking animation */}
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          </div>
          <h3 className="text-2xl font-black bg-gradient-to-r from-chef-600 via-chef-700 to-chef-800 bg-clip-text text-transparent mb-3">
            🚀 Firing up the AI Kitchen...
          </h3>
          <p className="text-lg text-gray-700 font-semibold">Crafting your personalized culinary magic</p>
        </motion.div>
      </div>
    )
  }

  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUsPageWrapper />} />
        <Route path="/pricing" element={<PricingPageWrapper />} />
        <Route path="/contact" element={<ContactPageWrapper />} />
        <Route path="/privacy" element={<PrivacyPolicyPageWrapper />} />
        <Route path="/terms" element={<TermsOfServicePageWrapper />} />
        <Route path="/help" element={<HelpCenterPageWrapper />} />
        <Route path="/careers" element={<CareersPageWrapper />} />
        <Route path="/cookies" element={<CookiePolicyPageWrapper />} />
        <Route path="/gdpr" element={<GDPRPageWrapper />} />
        <Route path="/press" element={<PressPageWrapper />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <RecipeGeneratorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-plans"
          element={
            <ProtectedRoute>
              <MealPlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <MyRecipesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shopping-lists"
          element={
            <ProtectedRoute>
              <ShoppingListsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="chefoodai-theme">
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <SavedRecipesProvider>
              <AppContent />
            </SavedRecipesProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
      <ReactQueryDevtools
        initialIsOpen={false}
      />
    </QueryClientProvider>
  )
}

export default App