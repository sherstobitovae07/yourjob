// src/app/dashboard/student/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { studentProfileService } from "@/services/studentProfileService";
import type { StudentProfile } from "@/services/studentProfileService";
import { getFileUrl } from "@/utils/fileHelper";
import styles from '@/styles/dashboard/studentProfile.module.css';

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
    <main className={styles.main} suppressHydrationWarning>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div style={{ flex: 1 }}>
            <h1 className={styles.title}>Профиль студента</h1>
          </div>
          <Link href="/dashboard/employer" className={styles.backButton}>НАЗАД К ЗАЯВКАМ</Link>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className={styles.loadingBox}>
            <p className={styles.loadingText}>Загрузка профиля...</p>
          </div>
        ) : (
          <>
            <div className={styles.twoCol}>
              <div className={styles.leftCard}>
                <div className={styles.imageWrap}>
                  {displayProfile.photo_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getFileUrl(displayProfile.photo_path)} alt={fullName} className={styles.img} />
                  ) : (
                    <div className={styles.placeholder}>{displayProfile.first_name ? displayProfile.first_name.charAt(0).toUpperCase() : 'S'}</div>
                  )}
                </div>
                <div className={styles.leftFooter}>
                  <div className={styles.leftName}>{`${displayProfile.first_name || ''} ${displayProfile.last_name || ''}`.trim()}</div>
                  <div className={styles.leftEmail}>{displayProfile.email || ''}</div>
                </div>
              </div>

              <div className={styles.rightCard}>
                <h2 className={styles.educationTitle}>Образование</h2>
                <div className={styles.fieldGrid}>
                  <div>
                    <div className={styles.fieldLabel}>Университет</div>
                    <div className={styles.fieldValue}>{displayProfile.university || 'Не указан'}</div>
                  </div>

                  <div className={styles.row}>
                    <div>
                      <div className={styles.fieldLabel}>Факультет</div>
                      <div className={styles.fieldValue}>{displayProfile.faculty || 'Не указан'}</div>
                    </div>

                    <div>
                      <div className={styles.fieldLabel}>Специальность</div>
                      <div className={styles.fieldValue}>{displayProfile.specialty || 'Не указана'}</div>
                    </div>
                  </div>

                  <div>
                      <div className={styles.fieldLabel}>Резюме</div>
                    </div>

                    <div className={styles.resumeField}>
                      <div className={styles.resumeRow}>
                        <div className={styles.resumeIcon}>📄</div>
                        <div className={styles.resumeName}>{displayProfile.resume_path ? displayProfile.resume_path.split('/').pop() : 'Резюме не загружено'}</div>
                      </div>
                      {displayProfile.resume_path && (
                        <button className={styles.resumeButton} onClick={() => window.open(getFileUrl(displayProfile.resume_path!), '_blank')}>ОТКРЫТЬ</button>
                      )}
                    </div>
                </div>
              </div>
            </div>

            <div className={styles.infoBox}>
              <p><strong>Совет:</strong> Проверьте профиль студента на соответствие требованиям стажировки. Обратите внимание на университет, специальность и наличие резюме.</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}