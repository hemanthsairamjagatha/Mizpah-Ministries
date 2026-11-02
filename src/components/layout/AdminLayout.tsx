import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Sparkles,
  HeartHandshake,
  Tv,
  Camera,
  CreditCard,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Church,
  ShieldCheck,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import Seo from '../Seo';
import { Button } from '../common/Button';
import { toast } from 'sonner';

export const AdminLayout: React.FC = () => {
  const { user, profile, signOut, isSuperAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/admin/login');
    } catch (err: any) {
      toast.error(err.message || 'Error signing out');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Hero Slides', path: '/admin/hero', icon: Sparkles },
    { label: 'About God Cards', path: '/admin/about-god', icon: Church },
    { label: 'Pastoral Founder', path: '/admin/founder', icon: HeartHandshake },
    { label: 'Sermons Archive', path: '/admin/sermons', icon: Tv },
    { label: 'Photo Gallery', path: '/admin/gallery', icon: Camera },
    { label: 'Donation & Bank', path: '/admin/donate', icon: CreditCard },
    { label: 'Campuses', path: '/admin/campuses', icon: MapPin },
    { label: 'Contact Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
    ...(isSuperAdmin
      ? [{ label: 'Admin Users', path: '/admin/users', icon: Users }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Seo path="/admin" noindex />
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-950 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar-thumb]:hidden [&::-webkit-scrollbar-thumb]:bg-transparent ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-navy-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img
              src="/images/logo.png"
              alt="Church Admin"
              className="h-9 w-auto object-contain drop-shadow-xs"
            />
            <div>
              <span
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="font-inter font-bold text-base text-white tracking-tight block leading-none"
              >
                Church Admin
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-semibold">
                Portal Management
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar-thumb]:hidden [&::-webkit-scrollbar-thumb]:bg-transparent">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile & Actions */}
        <div className="p-3 border-t border-navy-800 space-y-2">
          {/* View Public Website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-navy-900 rounded-lg transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              View Live Website
            </span>
            <span>↗</span>
          </a>

          {/* User profile info */}
          <div className="px-3.5 py-2.5 rounded-xl bg-navy-900 flex items-center justify-between">
            <div className="flex flex-col truncate pr-2">
              <span className="text-xs font-semibold text-white truncate">
                {profile?.display_name || user?.email?.split('@')[0] || 'Admin'}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                {profile?.role || 'admin'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-navy-700 hover:bg-slate-100 rounded-lg lg:hidden shrink-0"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-navy-600 truncate">
              <span className="font-semibold text-navy-900">Admin Console</span>
              <span className="text-slate-300">/</span>
              <span className="capitalize text-sky-600 font-medium truncate">Overview & Content</span>
            </div>
            <span className="font-bold text-navy-900 text-sm sm:hidden truncate">
              Church Admin
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ExternalLink className="w-3.5 h-3.5 text-navy-400" />}
                className="text-xs font-medium"
              >
                Public Portal
              </Button>
            </a>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<LogOut className="w-4 h-4 text-navy-500" />}
              onClick={handleLogout}
              className="text-xs px-2.5 sm:px-3"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Nested Routes */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
