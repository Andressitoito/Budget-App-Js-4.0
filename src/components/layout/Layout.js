// src/components/layout/Layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    if (token && userParam) {
      setUserData(JSON.parse(decodeURIComponent(userParam)));
    }
  }, []);

  const handleLogout = () => {
    router.push('/');
    toast.success('Logged out successfully');
  };

  const handleDashboardClick = () => {
    if (!userData) {
      toast.error('Session invalid, please log in again');
      router.push('/');
    } else {
      router.push(`/dashboard?orgId=${userData.defaultOrgId}&token=${router.query?.token || ''}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-blue-600 text-white p-4 fixed top-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button onClick={handleDashboardClick} className="text-lg font-semibold hover:underline">
              Dashboard
            </button>
            <div className="text-lg font-semibold">Charts (Coming Soon)</div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
            </button>
          </div>
          <div className={`md:flex items-center space-x-4 ${isMenuOpen ? 'flex flex-col absolute top-16 left-0 right-0 bg-blue-600 p-4' : 'hidden md:block'}`}>
            <button
              onClick={() => router.push(`/organizations?token=${router.query?.token || ''}&user=${encodeURIComponent(JSON.stringify(userData))}`)}
              className="hover:underline"
            >
              Organizations
            </button>
            <button onClick={handleLogout} className="hover:underline">
              Log Out
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-grow pt-16">{children}</main>
    </div>
  );
}