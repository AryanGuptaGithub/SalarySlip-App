'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, FileText, DollarSign, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">FinanceFlow</span>
          </div>
          <Link 
            href="/auth/login"
            data-testid="header-login-btn"
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all font-medium"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-heading font-bold tracking-tight leading-tight text-foreground mb-6">
          Simplify Your Payment
          <br />
          <span className="text-primary">Management Workflow</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto mb-10">
          Automate recurring payments, generate professional salary slips, and track your financial operations seamlessly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            data-testid="hero-get-started-btn"
            className="px-8 py-3 bg-primary text-white bg-black rounded-lg hover:bg-primary/90 transition-all  hover:shadow-md font-medium inline-flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            data-testid="hero-login-btn"
            className="px-8 py-3  bg-green-400 text-white border-input bg-background hover:bg-accent transition-all rounded-lg font-medium"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Employee Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manage employee profiles, roles, and salary structures efficiently.
            </p>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Salary Slips</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generate professional salary slips with PDF export functionality.
            </p>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Payment Tracking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track all payments with detailed history and status updates.
            </p>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">Reports & Analytics</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get insights with comprehensive dashboards and reports.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 FinanceFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}