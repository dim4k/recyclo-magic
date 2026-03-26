import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recyclo Magix',
  description: 'POC Recyclo Magix',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning className="antialiased min-h-screen flex justify-center bg-gray-900" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?q=80&w=1080&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <main className="w-full max-w-md bg-gradient-to-b from-[#b2f0db]/95 to-[#80e5b9]/95 min-h-screen shadow-2xl overflow-hidden relative backdrop-blur-sm">
          {children}
        </main>
      </body>
    </html>
  );
}
