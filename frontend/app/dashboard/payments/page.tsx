'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const data = await api.getPayments(token);
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setPayments(data.payments || []);
      } catch (error) {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [router]);

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
      <div className="space-y-8" data-testid="payments-page">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">Payments</h1>
          <p className="text-base leading-relaxed text-muted-foreground mt-2">View all payment transactions</p>
        </div>

        {payments.length === 0 ? (
          <div className="bg-card rounded-lg border shadow-sm p-12 text-center">
            <h3 className="text-xl font-heading font-semibold mb-2">No Payments Yet</h3>
            <p className="text-muted-foreground">Payment history will appear here once transactions are made.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden" data-testid="payments-table">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 text-sm font-medium">{payment.employeeId?.name || 'N/A'}</td>
                      <td className="p-4 text-sm font-mono font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="p-4 text-sm">{payment.paymentMethod}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(payment.paymentDate)}</td>
                      <td className="p-4 text-sm font-mono text-muted-foreground">{payment.transactionId || '-'}</td>
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
      </div>
    </DashboardLayout>
  );
}