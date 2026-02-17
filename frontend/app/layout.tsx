import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'FinanceFlow - Payment Management SaaS',
  description: 'Manage recurring payments, generate salary slips, and track financial workflows',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}