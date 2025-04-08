// src/app/layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer, toast } from 'react-toastify';
import { AiOutlineHome, AiOutlineBarChart, AiOutlineBell, AiOutlineLogout } from 'react-icons/ai';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

export default function RootLayout({ children }) {
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [incomingTransactions, setIncomingTransactions] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpenTransactionModal = (transactionId) => {
    if (pathname === '/dashboard') {
      window.dispatchEvent(new CustomEvent('openTransactionModal', { detail: transactionId }));
    } else {
      const token = searchParams.get('token');
      router.push(`/dashboard?orgId=${userData?.defaultOrgId}&token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}&transaction=${transactionId}`);
    }
    setIsNotifOpen(false);
  };

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const code = searchParams.get('code');

    if (code) {
      fetch('/api/users/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri: 'http://localhost:3000/dashboard' }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.token && data.user) {
            setUserData(data.user);
            setIncomingTransactions([
              { _id: 'mock1', name: 'Payment 1', amount: 4000, user_id: 'mock_user', organization_id: 'mock_org' }
            ]);
            router.replace(`/dashboard?orgId=${data.user.defaultOrgId}&token=${data.token}&user=${encodeURIComponent(JSON.stringify(data.user))}`);
          } else {
            throw new Error('Login failed');
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          toast.error('Login failed, try again');
          router.push('/');
        });
    } else if (token && userParam) {
      setUserData(JSON.parse(decodeURIComponent(userParam)));
      setIncomingTransactions([
        { _id: 'mock1', name: 'Payment 1', amount: 4000, user_id: 'mock_user', organization_id: 'mock_org' }
      ]);
    } else if (pathname !== '/' && !userData) {
      // Redirect to login if no user data on protected routes
      router.push('/');
    }
  }, [searchParams, router]);

  const handleLogout = () => {
    setUserData(null); // Clear userData first
    setIncomingTransactions([]); // Clear transactions
    router.replace('/'); // Use replace to avoid back-button issues
    toast.success('Logged out successfully');
  };

  const handleDashboardClick = () => {
    if (pathname === '/dashboard') return;
    if (!userData) {
      toast.error('Session invalid, please log in again');
      router.push('/');
    } else {
      const token = searchParams.get('token');
      router.push(`/dashboard?orgId=${userData.defaultOrgId}&token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    }
  };

  const handleOrganizationsClick = () => {
    if (!userData) return;
    const token = searchParams.get('token');
    router.push(`/organizations?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  };

  return (
    <html lang="en" className="bg-gray-100">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <nav className="bg-blue-600 text-white p-4 fixed w-full top-0 z-20">
            <div className="container mx-auto flex justify-between items-center">
              <span className="text-xl font-bold">Budget App Js 4.0</span>
              {userData ? (
                <div className="flex space-x-4 items-center">
                  <button
                    onClick={handleDashboardClick}
                    className="flex items-center bg-blue-700 px-3 py-1 rounded-md hover:bg-blue-800"
                  >
                    <AiOutlineHome size={16} className="mr-2" /> Dashboard
                  </button>
                  <button className="flex items-center px-3 py-1 rounded-md opacity-50 cursor-not-allowed">
                    <AiOutlineBarChart size={16} className="mr-2" /> Charts
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className={`flex items-center bg-blue-700 px-3 py-1 rounded-md hover:bg-blue-800 ${incomingTransactions.length > 0 ? 'animate-pulse' : ''}`}
                    >
                      <AiOutlineBell size={16} className="mr-2" /> Buys
                      {incomingTransactions.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {incomingTransactions.length}
                        </span>
                      )}
                    </button>
                    {isNotifOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-md shadow-lg">
                        {incomingTransactions.length > 0 ? (
                          incomingTransactions.map(t => (
                            <button
                              key={t._id}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                              onClick={() => handleOpenTransactionModal(t._id)}
                            >
                              {t.name} - ${t.amount}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No new transactions</div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center bg-blue-700 px-3 py-1 rounded-md hover:bg-blue-800"
                  >
                    <AiOutlineLogout size={16} className="mr-2" /> Log Out
                  </button>
                </div>
              ) : null} {/* Changed "" to null for clarity */}
            </div>
          </nav>
          <main className="pt-16">{children}</main>
          <ToastContainer position="top-right" autoClose={3000} />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}