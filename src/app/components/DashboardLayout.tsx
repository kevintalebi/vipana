'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CloseIcon, MenuIcon, HomeIcon, BackArrowIcon, ForwardArrowIcon, LoadingSpinnerIcon } from './Icons';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: NavLink[];
  title: string;
  homeLink: string;
}

export default function DashboardLayout({ children, links, title, homeLink }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { isNavigating, navigateWithLoading } = useNavigationWithLoading();

  const handleLinkClick = async (link: NavLink) => {
    if (link.onClick) {
      link.onClick();
    } else if (link.href !== '#') {
      await navigateWithLoading(link.href);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 flex items-center gap-3 shadow-lg border border-white/20">
            <LoadingSpinnerIcon className="h-6 w-6 text-purple-600" />
            <span className="text-gray-700">در حال بارگذاری...</span>
          </div>
        </div>
      )}
      
      <aside
        className={`bg-white shadow-xl transition-all duration-300 ease-in-out
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          fixed inset-y-0 right-0 z-30 w-64 transform md:relative md:translate-x-0
          ${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
        }
      >
        <div className={`flex items-center p-4 border-b h-16 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div 
            className={`text-xl font-bold text-purple-700 cursor-pointer whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}
            onClick={() => navigateWithLoading(homeLink)}
          >
            {title}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:block p-2 rounded-full hover:bg-gray-200">
            <MenuIcon />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <div
                  className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
                    pathname === link.href
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  onClick={() => handleLinkClick(link)}
                >
                  {isNavigating && pathname === link.href ? (
                    <LoadingSpinnerIcon className="h-5 w-5" />
                  ) : (
                    link.icon
                  )}
                  <span className={`mr-3 overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {isNavigating && pathname === link.href ? 'در حال بارگذاری...' : link.label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b md:hidden">
            <h1 className="text-xl font-semibold">{title}</h1>
            <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="text-gray-500 focus:outline-none">
                {mobileSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
        </main>
      </div>
    </div>
  );
} 