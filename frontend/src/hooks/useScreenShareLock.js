import { useEffect, useState } from "react";
import {
  getActiveDisplayCaptureCount,
  installDisplayCaptureMonitor
} from "../utils/screenShareGuard";

const DISPLAY_CAPTURE_PERMISSION = "display-capture";

export const useScreenShareLock = () => {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    installDisplayCaptureMonitor();

    let mounted = true;
    let intervalId;

    const checkLockState = async () => {
      const activeCapture = getActiveDisplayCaptureCount() > 0;
      let hasGrantedPermission = false;

      try {
        if (navigator.permissions?.query) {
          const permissionStatus = await navigator.permissions.query({ name: DISPLAY_CAPTURE_PERMISSION });
          hasGrantedPermission = permissionStatus.state === "granted";
        }
      } catch {
        // Permission query is not fully supported on all browsers.
      }

      if (mounted) {
        setIsLocked(activeCapture || hasGrantedPermission);
      }
    };

    checkLockState();
    intervalId = window.setInterval(checkLockState, 1400);

    return () => {
      mounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return isLocked;
};
