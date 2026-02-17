'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const data = await api.getEmployees(token);
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setEmployees(data.employees || []);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    const token = localStorage.getItem('token');
    try {
      const data = await api.deleteEmployee(token!, id);
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
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
      <div className="space-y-8" data-testid="employees-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight leading-tight">Employees</h1>
            <p className="text-base leading-relaxed text-muted-foreground mt-2">Manage your team members</p>
          </div>
          <Link
            href="/dashboard/employees/add"
            data-testid="add-employee-btn"
            className="bg-primary bg-green-300 text-green-700 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </Link>
        </div>

        {employees.length === 0 ? (
          <div className="bg-card rounded-lg border shadow-sm p-12 text-center">
            <h3 className="text-xl font-heading font-semibold mb-2">No Employees Yet</h3>
            <p className="text-muted-foreground mb-6">Get started by adding your first employee.</p>
            <Link
              href="/dashboard/employees/add"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden" data-testid="employees-table">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="p-4 border text-center">Name</th>
                    <th className="p-4 border text-center">Email</th>
                    <th className="p-4 border text-center">Designation</th>
                    <th className="p-4 border text-center">Department</th>
                    <th className="p-4 border text-center">Salary</th>
                    <th className="p-4 border text-center">Status</th>
                    <th className="p-4 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="border p-4 text-sm text-center font-medium">{employee.name}</td>
                      <td className="border p-4 text-sm text-center text-muted-foreground">{employee.email}</td>
                      <td className="border p-4 text-sm text-center">{employee.designation}</td>
                      <td className="border p-4 text-sm text-center">{employee.department}</td>
                      <td className="border p-4 text-sm text-center font-mono font-medium">{formatCurrency(employee.salary.basic)}</td>
                      <td className="p-4 border text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          employee.status === 'Active'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="p-4 border text-center w-fit ">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/employees/${employee._id}`}
                            data-testid={`view-employee-${employee._id}`}
                            className="p-2 hover:bg-accent rounded-md transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/employees/edit/${employee._id}`}
                            data-testid={`edit-employee-${employee._id}`}
                            className="p-2 hover:bg-accent rounded-md transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(employee._id)}
                            data-testid={`delete-employee-${employee._id}`}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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