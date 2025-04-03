// src/app/layout.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AiOutlineHome, AiOutlineBarChart, AiOutlineLogout } from 'react-icons/ai';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

export default function RootLayout({ children }) {
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict';
    router.push('/');
  };

  return (
    <html lang="en" className="bg-gray-100">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <nav className="bg-blue-600 text-white p-4 fixed w-full top-0 z-20">
            <div className="container mx-auto flex justify-between items-center">
              <span className="text-xl font-bold">Budget App Js 4.0</span>
              <div className="flex space-x-4">
                <button
                  className="flex items-center bg-blue-700 px-3 py-1 rounded-md"
                  onClick={() => router.push('/dashboard')}
                >
                  <AiOutlineHome size={16} className="mr-2" /> Home
                </button>
                <button className="flex items-center px-3 py-1 rounded-md opacity-50">
                  <AiOutlineBarChart size={16} className="mr-2" /> Charts
                </button>
                <div className="relative">
                  <button
                    className="flex items-center bg-blue-700 px-3 py-1 rounded-md"
                    onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
                  >
                    Organizations
                  </button>
                  {isOrgMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={() => router.push('/dashboard')}>
                        View Organizations
                      </button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={handleLogout}>
                        <AiOutlineLogout size={16} className="inline mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <main className="pt-16">{children}</main>
          <ToastContainer position="top-right" autoClose={3000} />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}