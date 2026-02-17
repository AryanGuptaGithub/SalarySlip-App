'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.login(formData.email, formData.password);
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-heading font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-center text-muted-foreground mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                data-testid="login-email-input"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="admin@financeflow.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                data-testid="login-password-input"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit-btn"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/register" className="text-primary hover:underline font-medium" data-testid="register-link">
              Register here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Demo credentials: admin@financeflow.com / password123</p>
        </div>
      </div>
    </div>
  );
}