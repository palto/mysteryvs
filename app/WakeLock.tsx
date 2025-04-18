import React, { useEffect, useRef } from "react";

export function WakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          console.log("Wake Lock is active");

          // Re-acquire the wake lock on visibility change
          document.addEventListener("visibilitychange", handleVisibilityChange);
        } else {
          console.warn("Wake Lock API is not supported in this browser.");
        }
      } catch (err) {
        console.error(`Wake Lock request failed`);
      }
    };

    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === "visible" &&
        wakeLockRef.current === null
      ) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.error("Failed to re-acquire wake lock:", err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log("Wake Lock released");
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

    void requestWakeLock();

    return () => {
      void releaseWakeLock();
    };
  }, []);

  return (
    <div>📱 This page will prevent your screen from sleeping while open.</div>
  );
}
