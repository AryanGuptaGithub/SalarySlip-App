'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function GenerateSalarySlipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    month: '',
    year: new Date().getFullYear().toString(),
    earnings: {
      basic: '',
      allowances: '',
      bonus: ''
    },
    deductions: {
      tax: '',
      providentFund: '',
      other: ''
    }
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token');
      try {
        const data = await api.getEmployees(token!);
        if (data.employees) {
          setEmployees(data.employees.filter((e: any) => e.status === 'Active'));
        }
      } catch (error) {
        toast.error('Failed to load employees');
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => e._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setFormData(prev => ({
        ...prev,
        employeeId,
        earnings: {
          basic: employee.salary.basic.toString(),
          allowances: employee.salary.allowances?.toString() || '0',
          bonus: '0'
        },
        deductions: {
          tax: '0',
          providentFund: '0',
          other: employee.salary.deductions?.toString() || '0'
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    try {
      const payload = {
        ...formData,
        year: parseInt(formData.year),
        earnings: {
          basic: parseFloat(formData.earnings.basic) || 0,
          allowances: parseFloat(formData.earnings.allowances) || 0,
          bonus: parseFloat(formData.earnings.bonus) || 0
        },
        deductions: {
          tax: parseFloat(formData.deductions.tax) || 0,
          providentFund: parseFloat(formData.deductions.providentFund) || 0,
          other: parseFloat(formData.deductions.other) || 0
        }
      };

      const data = await api.createSalarySlip(token!, payload);
      if (data.error || data.errors) {
        toast.error(data.error || 'Failed to generate salary slip');
        return;
      }

      toast.success('Salary slip generated successfully');
      router.push('/dashboard/salary-slips');
    } catch (error) {
      toast.error('Failed to generate salary slip');
    } finally {
      setLoading(false);
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <DashboardLayout>
      <div className="max-w-4xl" data-testid="generate-salary-slip-page">
        <Link
          href="/dashboard/salary-slips"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Salary Slips
        </Link>

        <h1 className="text-4xl font-heading font-bold tracking-tight leading-tight mb-2">Generate Salary Slip</h1>
        <p className="text-base leading-relaxed text-muted-foreground mb-8">Create a new salary slip for an employee</p>

        <form onSubmit={handleSubmit} className="space-y-8" data-testid="salary-slip-form">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-heading font-semibold">Employee & Period</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <label htmlFor="employee" className="block text-sm font-medium mb-2">Select Employee *</label>
                <select
                  id="employee"
                  required
                  data-testid="employee-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.employeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                >
                  <option value="">Choose an employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="month" className="block text-sm font-medium mb-2">Month *</label>
                <select
                  id="month"
                  required
                  data-testid="month-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                >
                  <option value="">Select month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-2">Year *</label>
                <input
                  id="year"
                  type="number"
                  required
                  data-testid="year-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-heading font-semibold">Earnings</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="basic" className="block text-sm font-medium mb-2">Basic Salary *</label>
                <input
                  id="basic"
                  type="number"
                  required
                  data-testid="basic-salary-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.earnings.basic}
                  onChange={(e) => setFormData({ ...formData, earnings: { ...formData.earnings, basic: e.target.value } })}
                />
              </div>
              <div>
                <label htmlFor="allowances" className="block text-sm font-medium mb-2">Allowances</label>
                <input
                  id="allowances"
                  type="number"
                  data-testid="allowances-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.earnings.allowances}
                  onChange={(e) => setFormData({ ...formData, earnings: { ...formData.earnings, allowances: e.target.value } })}
                />
              </div>
              <div>
                <label htmlFor="bonus" className="block text-sm font-medium mb-2">Bonus</label>
                <input
                  id="bonus"
                  type="number"
                  data-testid="bonus-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.earnings.bonus}
                  onChange={(e) => setFormData({ ...formData, earnings: { ...formData.earnings, bonus: e.target.value } })}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-heading font-semibold">Deductions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="tax" className="block text-sm font-medium mb-2">Tax</label>
                <input
                  id="tax"
                  type="number"
                  data-testid="tax-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.deductions.tax}
                  onChange={(e) => setFormData({ ...formData, deductions: { ...formData.deductions, tax: e.target.value } })}
                />
              </div>
              <div>
                <label htmlFor="pf" className="block text-sm font-medium mb-2">Provident Fund</label>
                <input
                  id="pf"
                  type="number"
                  data-testid="pf-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.deductions.providentFund}
                  onChange={(e) => setFormData({ ...formData, deductions: { ...formData.deductions, providentFund: e.target.value } })}
                />
              </div>
              <div>
                <label htmlFor="other" className="block text-sm font-medium mb-2">Other</label>
                <input
                  id="other"
                  type="number"
                  data-testid="other-deductions-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.deductions.other}
                  onChange={(e) => setFormData({ ...formData, deductions: { ...formData.deductions, other: e.target.value } })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              data-testid="generate-slip-btn"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 rounded-md font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Generating...</> : 'Generate Salary Slip'}
            </button>
            <Link
              href="/dashboard/salary-slips"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-6 py-2 rounded-md font-medium border border-transparent inline-flex items-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}