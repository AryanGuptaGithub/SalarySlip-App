'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    joiningDate: '',
    salary: {
      basic: '',
      allowances: '',
      deductions: ''
    },
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: ''
    },
    status: 'Active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    try {
      const payload = {
        ...formData,
        salary: {
          basic: parseFloat(formData.salary.basic) || 0,
          allowances: parseFloat(formData.salary.allowances) || 0,
          deductions: parseFloat(formData.salary.deductions) || 0
        }
      };

      const data = await api.createEmployee(token!, payload);
      if (data.error || data.errors) {
        toast.error(data.error || 'Failed to create employee');
        return;
      }

      toast.success('Employee added successfully');
      router.push('/dashboard/employees');
    } catch (error) {
      toast.error('Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl" data-testid="add-employee-page">
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-testid="back-to-employees"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </Link>

        <h1 className="text-4xl font-heading font-bold tracking-tight leading-tight mb-2">Add New Employee</h1>
        <p className="text-base leading-relaxed text-muted-foreground mb-8">Fill in the employee details</p>

        <form onSubmit={handleSubmit} className="space-y-8" data-testid="employee-form">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-heading font-semibold">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  required
                  data-testid="employee-name-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email *</label>
                <input
                  id="email"
                  type="email"
                  required
                  data-testid="employee-email-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  data-testid="employee-phone-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="joiningDate" className="block text-sm font-medium mb-2">Joining Date *</label>
                <input
                  id="joiningDate"
                  type="date"
                  required
                  data-testid="employee-joining-date-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-heading font-semibold">Position Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="designation" className="block text-sm font-medium mb-2">Designation *</label>
                <input
                  id="designation"
                  type="text"
                  required
                  data-testid="employee-designation-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-2">Department *</label>
                <input
                  id="department"
                  type="text"
                  required
                  data-testid="employee-department-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-heading font-semibold">Salary Details</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="basic" className="block text-sm font-medium mb-2">Basic Salary *</label>
                <input
                  id="basic"
                  type="number"
                  required
                  data-testid="employee-basic-salary-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.salary.basic}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, basic: e.target.value } })}
                />
              </div>
              <div>
                <label htmlFor="allowances" className="block text-sm font-medium mb-2">Allowances</label>
                <input
                  id="allowances"
                  type="number"
                  data-testid="employee-allowances-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.salary.allowances}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, allowances: e.target.value } })}
                />
              </div>
              <div>
                <label htmlFor="deductions" className="block text-sm font-medium mb-2">Deductions</label>
                <input
                  id="deductions"
                  type="number"
                  data-testid="employee-deductions-input"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.salary.deductions}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, deductions: e.target.value } })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              data-testid="save-employee-btn"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 rounded-md font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Saving...</> : 'Save Employee'}
            </button>
            <Link
              href="/dashboard/employees"
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