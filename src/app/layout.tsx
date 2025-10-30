import './globals.css';
export const metadata = { title: 'Ava Mirror', description: 'Explainable AI employee' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">{children}</body></html>
  );
}
