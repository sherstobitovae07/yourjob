"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { studentProfileService, type StudentProfile } from "../../../services/studentProfileService";
import { getFileUrl } from "../../../utils/fileHelper";
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
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [savedPhotoName, setSavedPhotoName] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

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
        setError(err?.message || 'Не удалось загрузить профиль');
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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      setError(null);
      setSelectedPhotoName(file.name);

      await studentProfileService.uploadPhoto(file);
      
      const fresh = await studentProfileService.getProfile();
      setProfile(fresh);
      setSavedPhotoName(file.name);
      setSelectedPhotoName("");
      
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      setError('Не удалось загрузить фото');
      setSelectedPhotoName("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const selectedFile = fileInputRef.current?.files?.[0];
      const selectedPhoto = photoInputRef.current?.files?.[0];

      if (selectedPhoto) await studentProfileService.uploadPhoto(selectedPhoto);
      if (selectedFile) await studentProfileService.uploadResume(selectedFile);

      const updated = await studentProfileService.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        university: formData.university,
        faculty: formData.faculty,
        specialty: formData.specialty,
      });

      const fresh = await studentProfileService.getProfile();
      setProfile(fresh);

      setFormData({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        university: updated.university || "",
        faculty: updated.faculty || "",
        specialty: updated.specialty || "",
      });

      if (selectedFile && !updated.resume_path) setSavedResumeName(selectedResumeName);
      else setSavedResumeName("");

      if (selectedPhoto && !fresh.photo_path) setSavedPhotoName(selectedPhotoName);
      else setSavedPhotoName("");

      setSelectedResumeName("");
      setSelectedPhotoName("");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Не удалось сохранить профиль');
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
    setSelectedPhotoName("");
    setIsEditing(false);
  };

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Профиль студента";

  return (
    <main className={styles.main} suppressHydrationWarning>
      <div className={styles.container}>
        {profile?.verification_status ? (
          <div className={styles.statusContainer}>
            {(() => {
              const st = String(profile.verification_status).toUpperCase();
              if (st === 'PENDING') return <div className={`${styles.statusBadge} ${styles.statusPending}`}>Аккаунт ожидает одобрения</div>;
              if (st === 'APPROVED') return <div className={`${styles.statusBadge} ${styles.statusApproved}`}>Аккаунт одобрен</div>;
              if (st === 'REJECTED') return <div className={`${styles.statusBadge} ${styles.statusRejected}`}>Аккаунт отклонён</div>;
              return <div className={styles.statusBadge}>{profile.verification_status}</div>;
            })()}
          </div>
        ) : null}

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.subtitle}>Ваш профиль</p>
          </div>
          <div className={styles.topActions}>
            <Link href="/dashboard/student" className={styles.linkButton}>
              На главную
            </Link>
            <DeleteAccountButton />
          </div>
        </div>

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
            <div className={styles.gridContainer}>
              <aside className={`${styles.card} ${styles.sidebarCard}`}>
                <div className={styles.photoContainerWrapper}>
                  <input 
                    ref={photoInputRef}
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className={styles.visuallyHidden}
                    onChange={handlePhotoSelect}
                  />
                  <div className={styles.photoContainer}>
                    {profile.photo_path ? (
                      <img src={getFileUrl(profile.photo_path)} alt="student" className={styles.photoImage} />
                    ) : (
                      <div className={styles.photoPlaceholder}>Нет фото</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.uploadPhotoButton}
                    onClick={() => photoInputRef.current?.click()}
                    title="Загрузить фото"
                    aria-label="Загрузить фото профиля"
                  >
                    <img src="/Edit-Image-Photo--Streamline-Core.svg" alt="upload" className={styles.uploadPhotoIcon} />
                  </button>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 className={styles.studentName}>{fullName}</h3>
                  <div className={styles.studentEmail}>{profile.email}</div>
                </div>
              </aside>

              <div className={styles.profileRightColumn}>
                <div className={`${styles.card} ${styles.profileCard}`}>
                  <div className={styles.profileHeader}>
                    <h2 className={styles.cardTitle}>{isEditing ? 'Редактирование профиля' : 'Ваши данные'}</h2>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className={styles.btnEdit}>Редактировать</button>}
                  </div>
                  <div className={styles.profileContent}>
                    <div className={styles.fieldGrid}>
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
                    <div className={styles.fieldGrid}>
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
                          <input ref={fileInputRef} id="resume-upload" type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className={styles.visuallyHidden} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setSelectedResumeName(file.name);
                          }} />
                          <label htmlFor="resume-upload" className={styles.fileField}>
                            <span>{selectedResumeName || profile.resume_path?.split('/').pop() || 'Загрузите файл в формате PDF'}</span>
                            <span style={{ color: '#0f172a', fontWeight: 700 }}>Выбрать</span>
                          </label>
                        </>
                      ) : (
                        <div className={styles.fileField} style={{ cursor: 'default' }}>
                          <span>{savedResumeName || profile.resume_path?.split('/').pop() || 'Резюме не загружено'}</span>
                          {profile.resume_path ? (
                            <a href={getFileUrl(profile.resume_path)} target='_blank' rel='noreferrer' style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>Открыть</a>
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
              </div>
            </div>
            <div className={styles.infoBoxContainer}>
              <div className={styles.infoBox}>
                <p style={{ margin: 0, color: '#0f172a', fontSize: '16px', lineHeight: 1.75 }}>
                  <strong>Совет:</strong> Регулярно обновляйте ваш профиль, чтобы работодатели видели актуальную информацию о вашем образовании, квалификации и опыте.
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
