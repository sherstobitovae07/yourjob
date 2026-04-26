"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardService } from '@/services/dashboardService';
import { logout } from '@/services/authService';

export default function DashboardEntry() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const user = await dashboardService.getCurrentUser();
        if (user.role === "STUDENT") {
          router.replace("/dashboard/student");
        } else if (user.role === "EMPLOYER") {
          router.replace("/dashboard/employer");
        } else if (user.role === "ADMIN") {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/auth");
        }
      } catch (err) {
        logout();
        router.replace("/auth");
      }
    };

    check();
  }, [router]);

  return <div>Загрузка...</div>;
}
