import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import type { ContactMessage } from '../../types/database.types';
import { formatDate } from '../../lib/utils';
import {
  Tv,
  Church,
  Camera,
  MessageSquare,
  MailCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { campusService } from '../../services/campusService';

interface Stats {
  sermonsCount: number;
  aboutGodCount: number;
  galleryCollectionsCount: number;
  totalMessagesCount: number;
  unreadMessagesCount: number;
  campusesCount: number;
}

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    sermonsCount: 0,
    aboutGodCount: 0,
    galleryCollectionsCount: 0,
    totalMessagesCount: 0,
    unreadMessagesCount: 0,
    campusesCount: 0,
  });
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [
        { count: sermonsCount },
        { count: aboutGodCount },
        { count: galleryCollectionsCount },
        { count: totalMessagesCount },
        { count: unreadMessagesCount },
        { data: messages },
        campusesList,
      ] = await Promise.all([
        supabase.from('sermons').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('about_god_cards').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('gallery_collections').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
        campusService.getAllCampuses().catch(() => []),
      ]);

      setStats({
        sermonsCount: sermonsCount || 0,
        aboutGodCount: aboutGodCount || 0,
        galleryCollectionsCount: galleryCollectionsCount || 0,
        totalMessagesCount: totalMessagesCount || 0,
        unreadMessagesCount: unreadMessagesCount || 0,
        campusesCount: campusesList?.length || 0,
      });
      setRecentMessages(messages || []);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const statCards = [
    {
      title: 'Published Sermons',
      value: stats.sermonsCount,
      link: '/admin/sermons',
      icon: Tv,
      color: 'text-sky-500 bg-sky-50',
    },
    {
      title: 'About God Cards',
      value: stats.aboutGodCount,
      link: '/admin/about-god',
      icon: Church,
      color: 'text-indigo-500 bg-indigo-50',
    },
    {
      title: 'Gallery Collections',
      value: stats.galleryCollectionsCount,
      link: '/admin/gallery',
      icon: Camera,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      title: 'Total Inquiries',
      value: stats.totalMessagesCount,
      link: '/admin/messages',
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessagesCount,
      link: '/admin/messages',
      icon: MailCheck,
      color: 'text-rose-500 bg-rose-50',
      badge: stats.unreadMessagesCount > 0 ? 'Needs Attention' : 'All Clear',
    },
    {
      title: 'Campuses',
      value: stats.campusesCount,
      link: '/admin/campuses',
      icon: MapPin,
      color: 'text-amber-500 bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="font-inter text-2xl sm:text-3xl font-bold text-navy-900">
            Church Dashboard Overview
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Real-time statistics and updates from your Supabase PostgreSQL database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardStats}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Data
          </Button>
          <Link to="/admin/sermons">
            <Button size="sm" variant="primary">
              + Add New Sermon
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {card.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      card.value > 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-medium text-navy-500">{card.title}</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-3xl font-bold text-navy-900 tracking-tight">
                    {loading ? '...' : card.value}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-navy-300 group-hover:text-sky-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Messages & Quick Content Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Messages Feed */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-inter text-lg font-bold text-navy-900">
                Recent Contact Submissions
              </h3>
              <p className="text-xs text-navy-500">Live inquiries submitted through the public website</p>
            </div>
            <Link
              to="/admin/messages"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <div className="py-12 text-center text-navy-400">
              <MailCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No contact messages received yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-navy-900 truncate">
                        {msg.name}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          msg.status === 'unread'
                            ? 'bg-rose-100 text-rose-700'
                            : msg.status === 'replied'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-xs text-navy-600 font-medium truncate">{msg.subject}</p>
                    <p className="text-xs text-navy-400 line-clamp-1">{msg.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-navy-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(msg.created_at)}
                    </span>
                    <Link
                      to="/admin/messages"
                      className="text-xs text-sky-600 font-semibold hover:underline block mt-1"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 space-y-4">
            <h3 className="font-inter text-lg font-bold text-navy-900">
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/admin/hero"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 transition group text-sm font-medium text-navy-700"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>Update Hero Banners</span>
                </div>
                <span>→</span>
              </Link>
              <Link
                to="/admin/gallery"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 transition group text-sm font-medium text-navy-700"
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-sky-500" />
                  <span>Upload Gallery Photos</span>
                </div>
                <span>→</span>
              </Link>
              <Link
                to="/admin/founder"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 transition group text-sm font-medium text-navy-700"
              >
                <div className="flex items-center gap-3">
                  <Church className="w-4 h-4 text-sky-500" />
                  <span>Edit Pastoral Bio & Vision</span>
                </div>
                <span>→</span>
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 transition group text-sm font-medium text-navy-700"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-sky-500" />
                  <span>Configure Site Settings</span>
                </div>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
