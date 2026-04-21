
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import StudentDashboard from "./StudentDashboard";
import { dashboardService } from "../../services/dashboardService";
import { logout } from "../../services/authService";
import type { StudentProfileData } from "../../types/dashboard";
export default function StudentPageClient() {
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
        if (currentUser.role !== "STUDENT") {
          if (currentUser.role === "ADMIN") {
            router.replace("/dashboard/admin");
          } else {
            router.replace("/dashboard/employer");
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
  if (!mounted) {
    return null;
  }
  return (
    <>
      <Navbar showProfileLink="/profile/student" />
      <div className="dashboard-page">
        {loading ? (
          <div style={{ padding: "80px 20px", textAlign: "center", color: "#cbd5e1", fontSize: "18px" }}>
            Загрузка...
          </div>
        ) : (
          <StudentDashboard />
        )}
      </div>
    </>
  );
}
