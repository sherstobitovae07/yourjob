"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from '@/utils/authHelper';
import { dashboardService } from '@/services/dashboardService';
import { logout } from '@/services/authService';
interface HomepageWrapperProps {
  children: React.ReactNode;
}
export default function HomepageWrapper({ children }: HomepageWrapperProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        setIsChecking(false);
        return;
      }
      try {
        const user = await dashboardService.getCurrentUser();
        if (user.role === "STUDENT") router.replace("/dashboard/student");
        else if (user.role === "EMPLOYER") router.replace("/dashboard/employer");
        else if (user.role === "ADMIN") router.replace("/dashboard/admin");
        else router.replace("/auth");
      } catch (error) {
        logout();
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [router]);
  if (isChecking) {
    return <div>Загрузка...</div>;
  }
  return <>{children}</>;
}
