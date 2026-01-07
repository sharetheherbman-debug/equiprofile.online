import { useState, useEffect } from "react";
import { adminToggle } from "@/lib/adminToggle";

/**
 * Hook to check if admin section is visible
 * Updates when admin section is shown/hidden via console commands
 */
export function useAdminToggle() {
  const [isAdminVisible, setIsAdminVisible] = useState(
    adminToggle.isAdminVisible()
  );

  useEffect(() => {
    const unsubscribe = adminToggle.subscribe(() => {
      setIsAdminVisible(adminToggle.isAdminVisible());
    });

    return unsubscribe;
  }, []);

  return { isAdminVisible };
}
