import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, CheckCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-blue-600 w-6 h-6" />
          <span className="text-xl font-bold text-gray-800">TyDee Tasks</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hello, <span className="font-semibold">{user?.username}</span>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 mt-3 pt-3 flex flex-col gap-2">
          <span className="text-sm text-gray-600 px-1">
            Hello, <span className="font-semibold">{user?.username}</span>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
