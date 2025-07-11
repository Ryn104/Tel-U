import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/data',
      label: 'Data',
      icon: (
        <svg className="xl:w-6 xl:h-6 w-4 h-4" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 14 9 14 9 17 15 17 15 14 21 14" />
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </g>
        </svg>
      ),
    },
    {
      to: '/home',
      label: 'Home',
      icon: (
        <svg className="xl:w-6 xl:h-6 w-4 h-4" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 11 12 2 23 11" />
            <path d="M5 13v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            <line x1="12" y1="22" x2="12" y2="18" />
          </g>
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white shadow border-t border-[#ddd] z-50">
      <div className="flex justify-around items-center h-16">
        {/* Link Navigation */}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs transition-all ${isActive
                ? 'text-[#E60000] font-semibold' // <-- warna merah aktif
                : 'text-gray-500 hover:text-[#E60000]' // <-- hover merah juga
              }`
            }
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-xs text-gray-500 hover:text-[#E60000] transition-all"
        >
          <svg className="xl:w-6 xl:h-6 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2"
            />
          </svg>
          <span className="mt-1">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
