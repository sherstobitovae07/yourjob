"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studentProfileService, type StudentProfile } from "../../../services/studentProfileService";
import DeleteAccountButton from '../../../components/Profile/DeleteAccountButton';
import styles from '@/styles/components/profile.module.css';
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
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        // Попробуем извлечь сообщение ошибки от сервера (если есть)
        let message = "Не удалось загрузить профиль";
        try {
          if (err?.response?.data) {
            const data = err.response.data;
            if (typeof data === 'string') message = data;
            else if (data?.message) message = data.message;
            else message = JSON.stringify(data);
          } else if (err?.message) {
            message = err.message;
          }
        } catch (e) {
          // ignore parsing errors
        }
        setError(message);
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
        // Загрузка резюме через отдельный POST-эндпоинт
        try {
          await studentProfileService.uploadResume(selectedFile);
          // После успешной загрузки резюме обновим остальные поля через PUT
          updated = await studentProfileService.updateProfile({
            first_name: formData.first_name,
            last_name: formData.last_name,
            university: formData.university,
            faculty: formData.faculty,
            specialty: formData.specialty,
          });
        } catch (e) {
          throw e;
        }
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
    <main className={styles.main} suppressHydrationWarning>
      <div className={styles.container}>
        {}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{fullName}</h1>
            <p className={styles.subtitle}>Ваш профиль</p>
          </div>
          <div className={styles.topActions}>
            <Link href="/dashboard/student" className={styles.linkButton}>
              На главную
            </Link>
            <DeleteAccountButton />
          </div>
        </div>
        {}
        {loading ? (
          <div className={styles.loadingBox}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>Загрузка профиля...</p>
          </div>
        ) : error && !profile ? (
          <div className={styles.errorBox}>
            <p style={{ color: '#f87171', fontSize: '16px', margin: 0 }}>⚠️ {error}</p>
          </div>
        ) : profile ? (
          <>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Контактная информация</h2>
              <div className={styles.gridTwo}>
                <div>
                  <label className={styles.mutedText}>Email</label>
                  <div className={styles.readonlyField}>{profile.email}</div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.cardTitle}>{isEditing ? 'Редактирование профиля' : 'Профиль'}</h2>
                {!isEditing && <button onClick={() => setIsEditing(true)} className={styles.btnEdit}>Редактировать</button>}
              </div>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
                  <div>
                    <label className={styles.mutedText}>Имя</label>
                    {isEditing ? (
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className={styles.input} />
                    ) : (
                      <div className={styles.readonlyField} style={{ color: formData.first_name ? '#1f2937' : '#64748b' }}>{formData.first_name || 'Не указано'}</div>
                    )}
                  </div>
                  <div>
                    <label className={styles.mutedText}>Фамилия</label>
                    {isEditing ? (
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className={styles.input} />
                    ) : (
                      <div className={styles.readonlyField} style={{ color: formData.last_name ? '#1f2937' : '#64748b' }}>{formData.last_name || 'Не указано'}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={styles.mutedText}>Университет</label>
                  {isEditing ? (
                    <input type="text" name="university" value={formData.university} onChange={handleInputChange} className={styles.input} />
                  ) : (
                    <div className={styles.readonlyField} style={{ color: formData.university ? '#1f2937' : '#64748b' }}>{formData.university || 'Не указан'}</div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
                  <div>
                    <label className={styles.mutedText}>Факультет</label>
                    {isEditing ? (
                      <input type="text" name="faculty" value={formData.faculty} onChange={handleInputChange} className={styles.input} />
                    ) : (
                      <div className={styles.readonlyField} style={{ color: formData.faculty ? '#1f2937' : '#64748b' }}>{formData.faculty || 'Не указан'}</div>
                    )}
                  </div>
                  <div>
                    <label className={styles.mutedText}>Специальность</label>
                    {isEditing ? (
                      <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className={styles.input} />
                    ) : (
                      <div className={styles.readonlyField} style={{ color: formData.specialty ? '#1f2937' : '#64748b' }}>{formData.specialty || 'Не указана'}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={styles.mutedText}>Резюме</label>
                  {isEditing ? (
                    <>
                      <input ref={fileInputRef} id="resume-upload" type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedResumeName(file.name);
                      }} />
                      <label htmlFor="resume-upload" className={styles.fileField}>
                        <span>{selectedResumeName || profile.resume_path?.split('/').pop() || 'Нажмите, чтобы загрузить резюме'}</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>Выбрать</span>
                      </label>
                    </>
                  ) : (
                    <div className={styles.fileField} style={{ cursor: 'default' }}>
                      <span>{savedResumeName || profile.resume_path?.split('/').pop() || 'Резюме не загружено'}</span>
                      {profile.resume_path ? (
                        <a href={profile.resume_path} target="_blank" rel="noreferrer" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>Открыть</a>
                      ) : null}
                    </div>
                  )}
                </div>
                {error && (
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0, padding: '12px 16px', background: '#fee2e2', borderRadius: 8 }}>{error}</p>
                )}
                {isEditing && (
                  <div className={styles.actionsRight} style={{ marginTop: 12 }}>
                    <button onClick={handleSave} disabled={isSaving} className={styles.btnPrimary} style={{ opacity: isSaving ? 0.6 : 1 }}>{isSaving ? 'Сохранение...' : 'Сохранить'}</button>
                    <button onClick={handleCancel} className={styles.btnEdit}>Отмена</button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoBox}>
              <p style={{ margin: 0, color: '#0f172a', fontSize: '16px', lineHeight: 1.75 }}>
                <strong>Совет:</strong> Регулярно обновляйте ваш профиль, чтобы работодатели видели актуальную информацию о вашем образовании, квалификации и опыте.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
