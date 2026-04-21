
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import EmployerDashboard from "./EmployerDashboard";
import { dashboardService } from "../../services/dashboardService";
import { logout } from "../../services/authService";
import type { EmployerProfileData } from "../../types/dashboard";
export default function EmployerPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const currentUser = await dashboardService.getCurrentUser();
        if (currentUser.role !== "EMPLOYER") {
          if (currentUser.role === "ADMIN") {
            router.replace("/dashboard/admin");
          } else {
            router.replace("/dashboard/student");
          }
          return;
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        logout();
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, [router]);
  return (
    <>
      <Navbar showProfileLink="/profile/employer" />
      <div className="dashboard-page">
        {loading ? (
          <div style={{ padding: "80px 20px", textAlign: "center", color: "#cbd5e1", fontSize: "18px" }}>
            Загрузка...
          </div>
        ) : (
          <EmployerDashboard />
        )}
      </div>
    </>
  );
}
