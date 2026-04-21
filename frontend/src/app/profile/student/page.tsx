"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studentProfileService, type StudentProfile } from "../../../services/studentProfileService";
export default function MyStudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedResumeName, setSelectedResumeName] = useState("");
  const [savedResumeName, setSavedResumeName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    university: "",
    faculty: "",
    specialty: "",
  });
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await studentProfileService.getProfile();
        setProfile(data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          university: data.university || "",
          faculty: data.faculty || "",
          specialty: data.specialty || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const selectedFile = fileInputRef.current?.files?.[0];
      let updated;
      if (selectedFile) {
        const payload = new FormData();
        payload.append("first_name", formData.first_name);
        payload.append("last_name", formData.last_name);
        payload.append("university", formData.university);
        payload.append("faculty", formData.faculty);
        payload.append("specialty", formData.specialty);
        payload.append("resume_file", selectedFile);
        updated = await studentProfileService.updateProfile(payload);
      } else {
        updated = await studentProfileService.updateProfile(formData);
      }
      setProfile((prev) => ({
        ...(updated || prev),
        resume_path: updated.resume_path || prev?.resume_path || null,
      }));
      setFormData({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        university: updated.university || "",
        faculty: updated.faculty || "",
        specialty: updated.specialty || "",
      });
      if (selectedFile && !updated.resume_path) {
        setSavedResumeName(selectedResumeName);
      } else {
        setSavedResumeName("");
      }
      setSelectedResumeName("");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Не удалось сохранить профиль");
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        university: profile.university || "",
        faculty: profile.faculty || "",
        specialty: profile.specialty || "",
      });
    }
    setSelectedResumeName("");
    setIsEditing(false);
  };
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Профиль студента";
  return (
    <main style={{ minHeight: "100vh", padding: "100px 24px 40px", background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)" }} suppressHydrationWarning>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: "#f8fafc", fontSize: "40px", fontWeight: 700, lineHeight: 1.2 }}>
              {fullName}
            </h1>
            <p style={{ margin: "12px 0 0", color: "#cbd5e1", fontSize: "16px" }}>
              Ваш профиль
            </p>
          </div>
          <Link
            href="/dashboard/student"
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
            На главную
          </Link>
        </div>
        {}
        {loading ? (
          <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "24px", padding: "60px 32px", textAlign: "center" }}>
            <p style={{ color: "#cbd5e1", fontSize: "16px" }}>Загрузка профиля...</p>
          </div>
        ) : error && !profile ? (
          <div style={{ background: "rgba(220, 38, 38, 0.12)", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: "24px", padding: "24px 32px" }}>
            <p style={{ color: "#f87171", fontSize: "16px", margin: 0 }}>⚠️ {error}</p>
          </div>
        ) : profile ? (
          <>
            {}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", marginBottom: "24px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
              <h2 style={{ margin: "0 0 24px", color: "#0f172a", fontSize: "20px", fontWeight: 700 }}>Контактная информация</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Email
                  </label>
                  <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: "#1f2937", fontSize: "16px", fontWeight: 600 }}>
                    {profile.email}
                  </div>
                </div>
              </div>
            </div>
            {}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", marginBottom: "24px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
              <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "20px", fontWeight: 700 }}>
                  {isEditing ? "Редактирование профиля" : "Профиль"}
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 8px 20px rgba(6, 182, 212, 0.18)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 10px 26px rgba(6, 182, 212, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(6, 182, 212, 0.18)";
                    }}
                  >
                    Редактировать
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
                  {}
                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Имя
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#1f2937",
                          fontSize: "16px",
                          fontWeight: 500,
                          outline: "none",
                          transition: "all 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#06b6d4";
                          e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: formData.first_name ? "#1f2937" : "#64748b", fontSize: "16px", fontWeight: 600 }}>
                        {formData.first_name || "Не указано"}
                      </div>
                    )}
                  </div>
                  {}
                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Фамилия
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#1f2937",
                          fontSize: "16px",
                          fontWeight: 500,
                          outline: "none",
                          transition: "all 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#06b6d4";
                          e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: formData.last_name ? "#1f2937" : "#64748b", fontSize: "16px", fontWeight: 600 }}>
                        {formData.last_name || "Не указано"}
                      </div>
                    )}
                  </div>
                </div>
                {}
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Университет
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#1f2937",
                        fontSize: "16px",
                        fontWeight: 500,
                        outline: "none",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#06b6d4";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.2)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  ) : (
                    <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: formData.university ? "#1f2937" : "#64748b", fontSize: "16px", fontWeight: 600 }}>
                      {formData.university || "Не указан"}
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
                  {}
                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Факультет
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="faculty"
                        value={formData.faculty}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#1f2937",
                          fontSize: "16px",
                          fontWeight: 500,
                          outline: "none",
                          transition: "all 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#06b6d4";
                          e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: formData.faculty ? "#1f2937" : "#64748b", fontSize: "16px", fontWeight: 600 }}>
                        {formData.faculty || "Не указан"}
                      </div>
                    )}
                  </div>
                  {}
                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Специальность
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#1f2937",
                          fontSize: "16px",
                          fontWeight: 500,
                          outline: "none",
                          transition: "all 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#06b6d4";
                          e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", color: formData.specialty ? "#1f2937" : "#64748b", fontSize: "16px", fontWeight: 600 }}>
                        {formData.specialty || "Не указана"}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Резюме
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        ref={fileInputRef}
                        id="resume-upload"
                        type="file"
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedResumeName(file.name);
                          }
                        }}
                      />
                      <label htmlFor="resume-upload" style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", color: "#1f2937", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}>
                        <span>{selectedResumeName || profile.resume_path?.split("/").pop() || "Нажмите, чтобы загрузить резюме"}</span>
                        <span style={{ color: "#0f172a", fontWeight: 700 }}>Выбрать</span>
                      </label>
                    </>
                  ) : (
                    <div style={{ width: "100%", minHeight: "52px", padding: "14px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", color: "#1f2937", fontSize: "16px", fontWeight: 600 }}>
                      <span>{savedResumeName || profile.resume_path?.split("/").pop() || "Резюме не загружено"}</span>
                      {profile.resume_path ? (
                        <a href={profile.resume_path} target="_blank" rel="noreferrer" style={{ color: "#0f172a", fontWeight: 700, textDecoration: "none" }}>
                          Открыть
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
                {error && (
                  <p style={{ color: "#dc2626", fontSize: "14px", margin: 0, padding: "12px 16px", background: "#fee2e2", borderRadius: "8px" }}>
                    {error}
                  </p>
                )}
                {isEditing && (
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{
                        flex: 1,
                        padding: "14px 24px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "14px",
                        border: "none",
                        cursor: isSaving ? "not-allowed" : "pointer",
                        opacity: isSaving ? 0.6 : 1,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(6, 182, 212, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {isSaving ? "Сохранение..." : "Сохранить"}
                    </button>
                    <button
                      onClick={handleCancel}
                      style={{
                        flex: 1,
                        padding: "14px 24px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "14px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(6, 182, 212, 0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                )}
              </div>
            </div>
            {}
            <div style={{ background: "#d1f5ff", border: "1px solid #7dd3fc", borderRadius: "24px", padding: "24px 32px" }}>
              <p style={{ margin: 0, color: "#0f172a", fontSize: "16px", lineHeight: 1.75 }}>
                <strong>Совет:</strong> Регулярно обновляйте ваш профиль, чтобы работодатели видели актуальную информацию о вашем образовании, квалификации и опыте.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
