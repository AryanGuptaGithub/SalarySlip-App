'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, FileText, DollarSign, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const data = await api.getDashboardStats(token);
        if (data.error) {
          toast.error(data.error);
          return;
        }

        setStats(data.stats);
        setChartData(data.chartData || []);
        setRecentPayments(data.recentPayments || []);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard-container">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight mb-2">
            Welcome Back, {user.name}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">{currentDate}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border shadow-sm" data-testid="stat-total-employees">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Total Employees</span>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-3xl font-heading font-bold">{stats?.totalEmployees || 0}</span>
            <span className="text-xs text-muted-foreground">Active employees</span>
          </div>

          <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border shadow-sm" data-testid="stat-monthly-payments">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground uppercase tracking-widest">This Month</span>
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <span className="text-3xl font-heading font-bold font-mono">
              {formatCurrency(stats?.totalPaymentsThisMonth || 0)}
            </span>
            <span className="text-xs text-muted-foreground">Total paid out</span>
          </div>

          <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border shadow-sm" data-testid="stat-pending-slips">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Pending</span>
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <span className="text-3xl font-heading font-bold">{stats?.pendingSalarySlips || 0}</span>
            <span className="text-xs text-muted-foreground">Salary slips pending</span>
          </div>

          <div className="flex flex-col gap-2 p-6 bg-card rounded-lg border shadow-sm" data-testid="stat-processed">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Processed</span>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-3xl font-heading font-bold">{chartData.reduce((acc: number, item: any) => acc + (item.count || 0), 0)}</span>
            <span className="text-xs text-muted-foreground">Total payments (6 months)</span>
          </div>
        </div>

        {/* Payment Trends Chart */}
        {chartData.length > 0 && (
          <div className="bg-card rounded-lg border shadow-sm p-6" data-testid="payment-chart">
            <h2 className="text-2xl font-heading font-semibold tracking-tight mb-6">Payment Trends</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    dot={{ fill: '#4F46E5', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Payments Table */}
        {recentPayments.length > 0 && (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden" data-testid="recent-payments">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-heading font-semibold tracking-tight">Recent Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment: any) => (
                    <tr key={payment._id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 text-sm">{payment.employeeId?.name || 'N/A'}</td>
                      <td className="p-4 text-sm font-mono font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(payment.paymentDate)}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          payment.status === 'Completed'
                            ? 'bg-success/10 text-success'
                            : payment.status === 'Pending'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {recentPayments.length === 0 && chartData.length === 0 && (
          <div className="bg-card rounded-lg border shadow-sm p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground">Start by adding employees and generating salary slips.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
