// src/components/layout/Layout.js
import { FiHome, FiBarChart2 } from 'react-icons/fi';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 fixed w-full top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-xl font-bold">Budget App Js 4.0</span>
          <div className="flex space-x-4">
            <button className="flex items-center bg-blue-700 px-3 py-1 rounded-md">
              <FiHome size={16} className="mr-2" /> Home
            </button>
            <button className="flex items-center px-3 py-1 rounded-md opacity-50">
              <FiBarChart2 size={16} className="mr-2" /> Charts
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">{children}</main>
    </div>
  );
}