import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, CheckCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <CheckCircle className="text-blue-600 w-6 h-6" />
        <span className="text-xl font-bold text-gray-800">TyDee Tasks</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden sm:inline">
          Hello, <span className="font-semibold">{user?.username}</span>
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
