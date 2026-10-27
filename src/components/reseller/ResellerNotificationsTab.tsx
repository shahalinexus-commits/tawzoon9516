import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell,
  CheckCircle,
  Tag,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCheck,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/api.js';
import { NotificationItem } from '../../types/index.js';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents.js';

export const ResellerNotificationsTab: React.FC = () => {
  const { lang, employeeToken } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!employeeToken) return;
    setLoading(true);
    try {
      const data = await api.employeeGetNotifications(employeeToken);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeToken]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  // Real-time synchronization
  useRealtimeEvents((event) => {
    if (
      event.type === 'NEW_NOTIFICATION' ||
      event.type === 'NOTIFICATION_ADDED' ||
      event.type === 'BRANDING_UPDATED' ||
      (event.type === 'STATE_UPDATED' && (event.data?.type === 'NOTIFICATION_ADDED' || event.data?.type === 'BRANDING_UPDATED'))
    ) {
      fetchNotifs();
    }
  });

  const handleMarkAsRead = async (id: string) => {
    if (!employeeToken) return;
    try {
      await api.employeeMarkNotificationRead(employeeToken, id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new CustomEvent('tawzoon_notifications_updated'));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!employeeToken) return;
    try {
      await api.employeeMarkAllNotificationsRead(employeeToken);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent('tawzoon_notifications_updated'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#009245]" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'রিসেলার নোটিফিকেশন ও ঘোষণা' : 'Notifications & Announcements'}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-[#e31b23] border border-rose-200 font-bold">
              {unreadCount} {lang === 'bn' ? 'টি নতুন' : 'unread'}
            </span>
          )}

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#009245] border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সব পড়া হয়েছে' : 'Mark all read'}</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80 p-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {lang === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {lang === 'bn' ? 'আপনার জন্য বর্তমানে কোনো নতুন নোটিফিকেশন বা আপডেট নেই।' : 'You have no new notifications or updates at the moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                item.isRead
                  ? 'bg-white border-slate-100 hover:border-slate-200'
                  : 'bg-emerald-50/40 border-emerald-200/70 shadow-2xs'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#009245] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                {item.type === 'COMMISSION' ? (
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                ) : item.type === 'SALE' ? (
                  <Tag className="w-4 h-4 text-sky-600" />
                ) : (
                  <Bell className="w-4 h-4 text-[#009245]" />
                )}
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {lang === 'bn' ? item.titleBn : item.titleEn}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'bn' ? item.messageBn : item.messageEn}
                </p>
              </div>

              {!item.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#009245] shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
