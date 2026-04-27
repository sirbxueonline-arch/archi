"use client";

import { useState, useEffect } from "react";

type NotificationPermission = "default" | "granted" | "denied";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) return "denied";

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      if (result === "granted") {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("[ArchiLink] Service worker registered:", registration.scope);
        } catch (err) {
          console.error("[ArchiLink] Service worker registration failed:", err);
        }
      }

      return result as NotificationPermission;
    } catch (err) {
      console.error("[ArchiLink] Permission request failed:", err);
      return "denied";
    }
  };

  return { permission, requestPermission, isSupported };
}
