import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

type Notification = {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const useNotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Add notification
  const addNotification = useCallback((
    type: Notification["type"],
    title: string,
    message: string,
    options?: {
      duration?: number;
      action?: Notification["action"];
    }
  ) => {
    const { duration = 5000, action } = options || {};
    
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      action,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after duration if provided
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, duration);
    }

    return newNotification.id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Predefined notification helpers
  const notify = {
    success: (title: string, message: string, options?: any) =>
      addNotification("success", title, message, options),
    
    error: (title: string, message: string, options?: any) =>
      addNotification("error", title, message, options),
    
    warning: (title: string, message: string, options?: any) =>
      addNotification("warning", title, message, options),
    
    info: (title: string, message: string, options?: any) =>
      addNotification("info", title, message, options),
  };

  // Fetch notifications from server (if user is authenticated)
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/notifications");
      
      if (response.ok) {
        const serverNotifications = await response.json();
        // Transform and merge with local notifications
        setNotifications(prev => [
          ...serverNotifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          })),
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [session]);

  // Mark notification as read on server
  const markAsReadOnServer = useCallback(async (id: string) => {
    if (!session?.user) return;

    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, [session]);

  return {
    // State
    notifications,
    unreadCount,
    
    // Actions
    addNotification,
    removeNotification,
    markAsRead: (id: string) => {
      markAsRead(id);
      markAsReadOnServer(id);
    },
    markAllAsRead: () => {
      markAllAsRead();
      // Mark all as read on server
      notifications.forEach(notification => {
        if (!notification.read) markAsReadOnServer(notification.id);
      });
    },
    clearAll,
    fetchNotifications,
    
    // Helpers
    notify,
    
    // Filtering
    getUnread: () => notifications.filter(n => !n.read),
    getByType: (type: Notification["type"]) => 
      notifications.filter(n => n.type === type),
  };
};