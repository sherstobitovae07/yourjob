"use client";

import { useEffect, useState, useRef } from "react";
import { getFileUrl } from '../../../utils/fileHelper';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { employerProfileService, type EmployerProfile } from "../../../services/employerProfileService";
import DeleteAccountButton from '../../../components/profile/DeleteAccountButton';
import styles from '@/styles/components/profile.module.css';

export default function MyEmployerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [savedPhotoName, setSavedPhotoName] = useState("");
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    description: "",
    website: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await employerProfileService.getProfile();
        setProfile(data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          company_name: data.company_name || "",
          description: data.description || "",
          website: data.website || "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await employerProfileService.updateProfile(formData);
      setProfile(updated);
      setFormData({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        company_name: updated.company_name || "",
        description: updated.description || "",
        website: updated.website || "",
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      const message = err instanceof Error ? err.message : "Не удалось сохранить профиль";
      setError(message || "Не удалось сохранить профиль");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      setError(null);
      setSelectedPhotoName(file.name);

      await employerProfileService.uploadPhoto(file);
      const fresh = await employerProfileService.getProfile();
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

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        company_name: profile.company_name || "",
        description: profile.description || "",
        website: profile.website || "",
      });
    }
    setIsEditing(false);
  };

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "";

  return (
    <main className={styles.main} suppressHydrationWarning>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.subtitle}>Ваш профиль работодателя</p>
          </div>
          <div className={styles.topActions}>
            <Link href="/dashboard/employer" className={styles.linkButton}>
              На главную
            </Link>
            <DeleteAccountButton />
          </div>
        </div>

        {/* Main Content */}
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
                    id="employer-photo-upload"
                    type="file"
                    accept="image/*"
                    className={styles.visuallyHidden}
                    onChange={handlePhotoSelect}
                  />
                  <div className={styles.photoContainer}>
                    {profile.photo_path ? (
                      <img src={getFileUrl(profile.photo_path)} alt="employer" className={styles.photoImage} />
                    ) : (
                      <div className={styles.photoPlaceholder}>Нет фото</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.uploadPhotoButton}
                    onClick={() => photoInputRef.current?.click()}
                    title="Загрузить фото"
                    aria-label="Загрузить фото компании"
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
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className={styles.cardTitle}>{isEditing ? 'Редактирование профиля' : 'Ваши данные'}</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className={styles.btnEdit}>
                    Редактировать
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Name */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "20px" }}>
                  {/* First Name */}
                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Имя
                    </label>
                    {isEditing ? (
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className={styles.input} />
                    ) : (
                      <div className={styles.readonlyField} style={{ color: formData.first_name ? '#1f2937' : '#64748b' }}>{formData.first_name || 'Не указано'}</div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Фамилия
                    </label>
                    {isEditing ? (
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className={styles.input} />
                    ) : (
                      <div className={styles.readonlyField} style={{ color: formData.last_name ? '#1f2937' : '#64748b' }}>{formData.last_name || 'Не указано'}</div>
                    )}
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Название компании
                  </label>
                  {isEditing ? (
                    <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className={styles.input} />
                  ) : (
                    <div className={styles.readonlyField} style={{ color: formData.company_name ? '#1f2937' : '#64748b' }}>{formData.company_name || 'Не указана'}</div>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Веб-сайт
                  </label>
                  {isEditing ? (
                    <input type="text" name="website" value={formData.website} onChange={handleInputChange} className={styles.input} />
                  ) : (
                    formData.website ? (
                      <a
                        href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.readonlyLink}
                      >
                        {formData.website}
                      </a>
                    ) : (
                      <div className={`${styles.readonlyField} ${styles.placeholderText}`}>Не указан</div>
                    )
                  )}
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Описание компании
                  </label>
                  {isEditing ? (
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className={styles.textarea} />
                  ) : (
                    <div className={`${styles.companyDescription} ${!formData.description ? styles.placeholderText : ''}`}>{formData.description || 'Не указано'}</div>
                  )}
                </div>

                {error && (
                  <p style={{ color: '#dc2626', fontSize: '14px', margin: 0, padding: '12px 16px', background: '#fee2e2', borderRadius: 8 }}>
                    {error}
                  </p>
                )}

                {isEditing && (
                  <div className={styles.actionsRight} style={{ marginTop: 12 }}>
                    <button onClick={handleSave} disabled={isSaving} className={styles.btnPrimary} style={{ opacity: isSaving ? 0.6 : 1 }}>
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button onClick={handleCancel} className={styles.btnEdit}>Отмена</button>
                  </div>
                )}
              </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className={styles.infoBoxContainer}>
              <div className={styles.infoBox}>
                <p style={{ margin: 0, color: '#0f172a', fontSize: '16px', lineHeight: 1.75 }}>
                  <strong>Совет:</strong> Регулярно обновляйте информацию о вашей компании, чтобы студенты видели актуальные данные о вашей организации и предложения о стажировках.
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
