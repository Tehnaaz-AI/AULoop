import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import { getSocket } from "../services/socket";

const UiContext = createContext(null);

export const UiProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notice, setNotice] = useState(null); // Temporary toast
  const [notifications, setNotifications] = useState([]); // Saved notifications
  const [newNotifications, setNewNotifications] = useState(false);

  // Sync notifications from backend and subscribe to socket room
  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      setNewNotifications(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        const mapped = data.map(n => ({ ...n, isNew: !n.read }));
        setNotifications(mapped);
        setNewNotifications(mapped.some(n => n.isNew));
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();

    const socket = getSocket(token);
    const handleNewNotification = (notification) => {
      const withIsNew = { ...notification, isNew: true };
      setNotifications((old) => [withIsNew, ...old].slice(0, 80));
      setNewNotifications(true);
      toast(notification.title || "New notification", "success");
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [token, user?._id, user?.id]);

  // Show a temporary toast (doesn't save to notifications)
  const toast = (message, type = "success") => {
    setNotice({ message, type, id: Date.now() });
    window.setTimeout(() => setNotice(null), 3500);
  };

  // Show a toast AND save to notifications
  const notify = (message, type = "success") => {
    const item = { message, type, id: Date.now(), time: new Date().toLocaleTimeString(), isNew: true };
    setNotice(item);
    setNotifications((old) => [item, ...old].slice(0, 20));
    setNewNotifications(true);
    window.setTimeout(() => setNotice(null), 3500);
  };

  const value = useMemo(
    () => ({ 
      toast, 
      notify, 
      notice, 
      setNotice, 
      notifications, 
      setNotifications, 
      newNotifications, 
      setNewNotifications 
    }),
    [notice, notifications, newNotifications]
  );

  return (
    <UiContext.Provider value={value}>
      {children}
    </UiContext.Provider>
  );
};

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) throw new Error("useUi must be used within a UiProvider");
  return context;
};
