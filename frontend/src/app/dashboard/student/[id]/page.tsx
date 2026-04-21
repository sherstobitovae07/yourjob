// src/app/dashboard/student/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { studentProfileService } from "@/services/studentProfileService";
import type { StudentProfile } from "@/services/studentProfileService";

interface StudentProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function StudentProfilePage({ params, searchParams }: StudentProfilePageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const studentId = resolvedParams.id;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentProfileService.getProfileById(parseInt(studentId, 10));
        setProfile(data);
      } catch (error) {
        console.error("Failed to load student profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentId]);

  const getSearchParam = (key: string) => {
    const value = resolvedSearchParams[key];
    return Array.isArray(value) ? value[0] : value || "";
  };

  const fallbackProfile: StudentProfile = {
    id: parseInt(studentId, 10),
    email: getSearchParam("email"),
    first_name: getSearchParam("first_name"),
    last_name: getSearchParam("last_name"),
    role: "STUDENT",
    university: getSearchParam("university") || null,
    faculty: getSearchParam("faculty") || null,
    specialty: getSearchParam("specialty") || null,
    resume_path: getSearchParam("resume_path") || null,
  };

  const displayProfile = profile ?? fallbackProfile;
  const fullName = `${displayProfile.first_name} ${displayProfile.last_name}`.trim() || `Студент ${studentId}`;

  return (
    <main style={{ minHeight: "100vh", padding: "100px 24px 40px", background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)" }} suppressHydrationWarning>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: "#f8fafc", fontSize: "40px", fontWeight: 700, lineHeight: 1.2 }}>
              {fullName}
            </h1>
            <p style={{ margin: "12px 0 0", color: "#cbd5e1", fontSize: "16px" }}>
              Профиль студента
            </p>
          </div>
          <Link
            href="/dashboard/employer"
            style={{
              padding: "12px 24px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
              color: "#ffffff",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
              fontSize: "14px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(6, 182, 212, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Назад к заявкам
          </Link>
        </div>

        {/* Main Content */}
        {loading ? (
          <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "24px", padding: "60px 32px", textAlign: "center" }}>
            <p style={{ color: "#cbd5e1", fontSize: "16px" }}>Загрузка профиля...</p>
          </div>
        ) : (
          <>
            {/* Contact Info Card */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", marginBottom: "24px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
              <h2 style={{ margin: "0 0 24px", color: "#0f172a", fontSize: "20px", fontWeight: 700 }}>Контактная информация</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Email
                  </label>
                  <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: "#1f2937", fontSize: "16px", fontWeight: 600, wordBreak: "break-all" }}>
                    {displayProfile.email || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Education Info Card */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", marginBottom: "24px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
              <h2 style={{ margin: "0 0 24px", color: "#0f172a", fontSize: "20px", fontWeight: 700 }}>Образование</h2>
              
              <div style={{ display: "grid", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Университет
                  </label>
                  <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: displayProfile.university ? "#1f2937" : "#64748b", fontSize: "16px", fontWeight: 600 }}>
                    {displayProfile.university || "Не указан"}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Факультет
                    </label>
                    <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: displayProfile.faculty ? "#1f2937" : "#64748b", fontSize: "16px", fontWeight: 600 }}>
                      {displayProfile.faculty || "Не указан"}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Специальность
                    </label>
                    <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: displayProfile.specialty ? "#1f2937" : "#64748b", fontSize: "16px", fontWeight: 600 }}>
                      {displayProfile.specialty || "Не указана"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Card */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", marginBottom: "24px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
              <h2 style={{ margin: "0 0 24px", color: "#0f172a", fontSize: "20px", fontWeight: 700 }}>Резюме</h2>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", background: "rgba(6, 182, 212, 0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "24px" }}>📄</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: displayProfile.resume_path ? "#1f2937" : "#94a3b8", fontSize: "16px", fontWeight: 600 }}>
                    {displayProfile.resume_path ? displayProfile.resume_path.split("/").pop() : "Резюме не загружено"}
                  </p>
                </div>
                {displayProfile.resume_path && (
                  <button
                    onClick={() => window.open(displayProfile.resume_path!, "_blank")}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                      color: "#0f172a",
                      fontWeight: 700,
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Открыть
                  </button>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div style={{ background: "#d1f5ff", border: "1px solid #7dd3fc", borderRadius: "24px", padding: "24px 32px" }}>
              <p style={{ margin: 0, color: "#0f172a", fontSize: "14px", lineHeight: 1.6 }}>
                <strong>Совет:</strong> Проверьте профиль студента на соответствие требованиям стажировки. Обратите внимание на университет, специальность и наличие резюме.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}