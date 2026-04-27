import React from 'react';
import { useResubmitProfile } from '@/hooks/useResubmitProfile';
import styles from '@/styles/components/profile.module.css';
import adminStyles from '@/styles/components/admin.module.css';

interface Props {
  onSuccess?: () => void;
}

export default function ResubmitForVerificationButton({ onSuccess }: Props) {
  const { isSubmitting, submit } = useResubmitProfile();

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleClick = async () => {
    // open confirm modal
    setConfirmOpen(true);
  };

  return (
    <>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleClick}
        className={styles.btnPrimary}
      >
        {isSubmitting ? 'Отправка...' : 'Отправить на повторную проверку'}
      </button>

      {confirmOpen && (
        <div className={adminStyles.modalBackdrop} onClick={() => { if (!isSubmitting) setConfirmOpen(false); }}>
          <div className={adminStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={adminStyles.modalHeader}>
              <h3 style={{ margin: 0 }}>Подтвердите действие</h3>
            </div>
            <div className={adminStyles.modalBody}>
              <p>Вы уверены, что хотите повторно отправить профиль на проверку?</p>
            </div>
            <div className={adminStyles.modalActions}>
              <button className={styles.btnEdit} onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>Отмена</button>
              <button
                className={styles.btnPrimary}
                onClick={async () => {
                  try {
                    await submit();
                    if (onSuccess) onSuccess();
                  } catch (err) {
                    console.error('Resubmit failed', err);
                  } finally {
                    setConfirmOpen(false);
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
