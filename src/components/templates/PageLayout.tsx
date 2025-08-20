// Main page layout template with navigation and responsive design
import { ReactNode, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  Heart, 
  Calendar, 
  ShoppingCart,
  Settings,
  LogOut,
  ChefHat,
  Bell
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';
import { useUIStore, useUserStore } from '@/stores';
import { useCurrentUser } from '@/lib/react-query';

interface PageLayoutProps {
  children?: ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const PageLayout = ({
  children,
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  className,
}: PageLayoutProps) => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, theme } = useUIStore();
  const { user, isAuthenticated } = useUserStore();
  const { data: currentUser } = useCurrentUser();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (sidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  const navigation = [
    { name: 'Discover', href: '/', icon: Search, current: location.pathname === '/' },
    { name: 'My Recipes', href: '/recipes', icon: ChefHat, current: location.pathname.startsWith('/recipes') },
    { name: 'Meal Plans', href: '/meal-plans', icon: Calendar, current: location.pathname.startsWith('/meal-plans') },
    { name: 'Favorites', href: '/favorites', icon: Heart, current: location.pathname === '/favorites' },
    { name: 'Shopping List', href: '/shopping', icon: ShoppingCart, current: location.pathname === '/shopping' },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Sign out', href: '/logout', icon: LogOut },
  ];

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-modal-backdrop bg-gray-900/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div className={cn(
          'fixed inset-y-0 left-0 z-modal flex w-64 flex-col bg-white shadow-lg transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ChefoodAI™</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  item.current
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    item.current
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          {isAuthenticated && currentUser && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon
                      className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className={cn(
        'flex flex-1 flex-col',
        showSidebar && 'lg:ml-64'
      )}>
        {/* Top header */}
        {showHeader && (
          <header className="sticky top-0 z-sticky bg-white border-b border-gray-200 shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              {/* Mobile menu button */}
              <div className="flex items-center gap-4">
                {showSidebar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                
                {/* Breadcrumb or page title can go here */}
                <div className="hidden lg:block">
                  {/* This could be dynamic based on route */}
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-2">
                {!isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/register">Sign up</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Search"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1">
          {children || <Outlet />}
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-white border-t border-gray-200">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <ChefHat className="h-6 w-6 text-primary-600" />
                    <span className="text-lg font-bold text-gray-900">ChefoodAI™</span>
                  </div>
                  <p className="text-sm text-gray-600 max-w-md">
                    Discover amazing recipes instantly. Create personalized meal plans 
                    and explore cuisines from around the world.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Platform</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link to="/recipes" className="hover:text-gray-900">Recipes</Link></li>
                    <li><Link to="/meal-plans" className="hover:text-gray-900">Meal Plans</Link></li>
                    <li><Link to="/favorites" className="hover:text-gray-900">Favorites</Link></li>
                    <li><Link to="/shopping" className="hover:text-gray-900">Shopping Lists</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Support</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link to="/help" className="hover:text-gray-900">Help Center</Link></li>
                    <li><Link to="/contact" className="hover:text-gray-900">Contact</Link></li>
                    <li><Link to="/privacy" className="hover:text-gray-900">Privacy</Link></li>
                    <li><Link to="/terms" className="hover:text-gray-900">Terms</Link></li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500">
                  © 2024 ChefoodAI™. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};