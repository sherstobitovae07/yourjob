"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../utils/authHelper";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthChecked(true);
    } else {
      router.push("/auth");
    }
  }, [router]);

  if (!authChecked) {
    return <div>Загрузка...</div>;
  }

  return <>{children}</>;
}
