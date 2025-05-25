"use client";

import React, { useState, useRef, useEffect } from 'react';
import { UserData } from '../types';
import RoleBadge from './RoleBadge';

interface UserInfoHeaderProps {
  userData: UserData | null;
  onLogout?: () => void;
}

const UserInfoHeader: React.FC<UserInfoHeaderProps> = ({ userData, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="ml-4 flex items-center md:ml-6">
      <div className="items-center space-x-2 text-gray-700 dark:text-gray-300 text-sm mr-4 hidden md:flex">
        <span>Welcome, {userData?.name || 'User'}</span>
        {userData?.role && <RoleBadge role={userData.role} />}
      </div>
      
      {onLogout && (
        <button
          onClick={onLogout}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mr-4 text-sm font-medium hidden md:flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          {userData?.name?.charAt(0) || 'U'}
        </button>
        
        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
              <div className="font-medium">{userData?.name}</div>
              <div className="text-gray-500 dark:text-gray-400 truncate">{userData?.email}</div>
            </div>
            
            <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Profile
            </a>
            
            <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Settings
            </a>
            
            {onLogout && (
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>    </div>  );
};

export default UserInfoHeader;
