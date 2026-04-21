'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/app/page.module.css';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className={styles.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="error-container" style={{ maxWidth: '600px' }}>
        <div style={{ fontSize: '5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '20px' }}>
          404
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: '#ffffff' }}>
          Страница не найдена
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '32px', color: '#cbd5e1', lineHeight: '1.6' }}>
          К сожалению, страница, которую вы ищете, не существует или была перемещена. 
          Пожалуйста, проверьте адрес и попробуйте ещё раз.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.back()}
            className={`${styles.roleBtn} ${styles.roleBtnActive}`}
            style={{ minWidth: '200px' }}
          >
            Вернуться назад
          </button>
          <Link
            href="/"
            className={`${styles.roleBtn} ${styles.roleBtnActive}`}
            style={{ minWidth: '200px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            На главную страницу
          </Link>
        </div>
      </div>
    </main>
  );
}
