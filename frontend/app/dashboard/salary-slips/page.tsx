'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Download, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function SalarySlipsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salarySlips, setSalarySlips] = useState<any[]>([]);

  useEffect(() => {
    const fetchSlips = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const data = await api.getSalarySlips(token);
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setSalarySlips(data.salarySlips || []);
      } catch (error) {
        toast.error('Failed to load salary slips');
      } finally {
        setLoading(false);
      }
    };

    fetchSlips();
  }, [router]);

  const handleDownloadPDF = async (id: string, employeeName: string) => {
    const token = localStorage.getItem('token');
    try {
      const blob = await api.downloadSalarySlipPDF(token!, id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary-slip-${employeeName.replace(' ', '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

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
      <div className="space-y-8" data-testid="salary-slips-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">Salary Slips</h1>
            <p className="text-base leading-relaxed text-muted-foreground mt-2">Generate and manage salary slips</p>
          </div>
          <Link
            href="/dashboard/salary-slips/generate"
            data-testid="generate-salary-slip-btn"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Slip
          </Link>
        </div>

        {salarySlips.length === 0 ? (
          <div className="bg-card rounded-lg border shadow-sm p-12 text-center">
            <h3 className="text-xl font-heading font-semibold mb-2">No Salary Slips Yet</h3>
            <p className="text-muted-foreground mb-6">Generate your first salary slip to get started.</p>
            <Link
              href="/dashboard/salary-slips/generate"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Slip
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden" data-testid="salary-slips-table">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Month</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Net Pay</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salarySlips.map((slip) => (
                    <tr key={slip._id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 text-sm font-medium">{slip.employeeId?.name || 'N/A'}</td>
                      <td className="p-4 text-sm">{slip.month}</td>
                      <td className="p-4 text-sm">{slip.year}</td>
                      <td className="p-4 text-sm font-mono font-medium">{formatCurrency(slip.netPay)}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          slip.status === 'Paid'
                            ? 'bg-success/10 text-success'
                            : slip.status === 'Pending'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {slip.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadPDF(slip._id, slip.employeeId?.name || 'employee')}
                            data-testid={`download-pdf-${slip._id}`}
                            className="p-2 hover:bg-accent rounded-md transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
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