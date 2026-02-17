'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  LogOut,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Salary Slips', href: '/dashboard/salary-slips', icon: FileText },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <span className="ml-3 text-xl font-heading font-bold">FinanceFlow</span>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 border-t p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Theme</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                data-testid="theme-toggle-btn"
                className="p-2 rounded-md hover:bg-accent transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
            <div className="bg-accent rounded-lg p-3 mb-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                {user.role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout-btn"
              className="w-full flex items-center border bg-red-300 text-red-500 hover:bg-red-400 hover:text-red-700 justify-center px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-all"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="ml-3 text-xl font-heading font-bold">FinanceFlow</span>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-all"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <header className="sticky top-0 z-10 bg-card/70 backdrop-blur-md border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-accent"
              data-testid="mobile-menu-btn"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="md:hidden flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-heading font-bold">FinanceFlow</span>
            </div>
            <div className="hidden md:block"></div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}