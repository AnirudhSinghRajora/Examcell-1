// File: src/app/layout.tsx
import { AuthProvider } from '@/context/AuthContext'; // Import the provider
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* Wrap everything here */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}