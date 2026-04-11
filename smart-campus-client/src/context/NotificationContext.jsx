import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  clearAll as apiClearAll,
  createClientNotification
} from '../api/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// A simple function to play a "pop" sound using Web Audio API
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainUrl = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gainUrl.gain.setValueAtTime(0, ctx.currentTime);
    gainUrl.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gainUrl.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gainUrl);
    gainUrl.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Toasts are the temporary popups shown on the screen
  const [activeToasts, setActiveToasts] = useState([]);
  
  // Reference to keep track of known IDs to detect newly arrived ones
  const knownIdsRef = useRef(new Set());
  // Prevent toasts on initial load
  const isInitialLoadRef = useRef(true);

  const fetchNotificationsData = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    try {
      const res = await getNotifications();
      const fetchedNotifications = res.data || [];
      
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
      
      const currentIds = new Set(knownIdsRef.current);
      const newItems = [];
      
      fetchedNotifications.forEach(n => {
        if (!currentIds.has(n.id)) {
          knownIdsRef.current.add(n.id);
          // If not initial load and the notification is unread, it's new
          if (!isInitialLoadRef.current && !n.read) {
            newItems.push(n);
          }
        }
      });
      
      if (newItems.length > 0) {
        // Reverse so chronological if multiple
        newItems.reverse().forEach(n => addToast(n));
        playNotificationSound();
      }
      
      isInitialLoadRef.current = false;
      
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [user]);

  // Initial load and polling
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      knownIdsRef.current.clear();
      isInitialLoadRef.current = true;
      return;
    }
    
    setLoading(true);
    fetchNotificationsData().finally(() => setLoading(false));
    
    const interval = setInterval(() => {
      fetchNotificationsData();
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, [user, fetchNotificationsData]);

  // Manually add a toast (also used when a new item is detected from server)
  const addToast = (notification) => {
    setActiveToasts(prev => [...prev, notification]);
  };

  const removeToast = (id) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const showNotification = async (title, message, type = 'SYSTEM_ANNOUNCEMENT') => {
    try {
      // 1. Save to backend to persist
      const res = await createClientNotification({ title, message, type });
      const newNotif = res.data;
      
      // 2. Add to known IDs
      knownIdsRef.current.add(newNotif.id);
      
      // 3. Update state
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // 4. Trigger toast directly
      addToast(newNotif);
      playNotificationSound();
      
    } catch (error) {
      console.error("Could not create local notification", error);
    }
  };

  /**
   * For the frontend to quickly trigger an ephemeral toast (e.g. success message)
   * without saving it to the backend Notification panel.
   */
  const showLocalToast = (title, message, type = 'SYSTEM_ANNOUNCEMENT') => {
    const tempId = 'local_' + Math.random().toString(36).substr(2, 9);
    addToast({
      id: tempId,
      title,
      message,
      type,
      read: true,
      createdAt: new Date().toISOString()
    });
    playNotificationSound();
  };

  // Actions
  const markAsRead = async (id) => {
    try {
      await apiMarkAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const deleteNotification = async (id) => {
    try {
      await apiDeleteNotification(id);
      setNotifications(prev => {
        const item = prev.find(n => n.id === id);
        if (item && !item.read) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n.id !== id);
      });
      // Known ID is removed so it could technically be re-notified if backend brought it back, but backend deleted it.
    } catch (e) { console.error(e); }
  };

  const clearAll = async () => {
    try {
      await apiClearAll();
      setNotifications([]);
      setUnreadCount(0);
      knownIdsRef.current.clear();
    } catch (e) { console.error(e); }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      activeToasts,
      removeToast,
      showNotification,
      showLocalToast,
      fetchNotificationsData,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
