import React, { useState } from 'react';
import { adminService } from '@/services/adminService';
import profileStyles from '@/styles/components/profile.module.css';
import adminStyles from '@/styles/components/admin.module.css';

interface Props {
  studentId: number;
  onUpdated?: (status: 'APPROVED' | 'REJECTED', comment?: string) => void;
}

export default function StudentVerificationForm({ studentId, onUpdated }: Props) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await adminService.approveStudent(studentId);
      if (onUpdated) onUpdated('APPROVED');
    } catch (err) {
      console.error('Approve failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      // simply do nothing if no comment provided
      return;
    }
    setLoading(true);
    try {
      await adminService.rejectStudent(studentId, comment.trim());
      if (onUpdated) onUpdated('REJECTED', comment.trim());
    } catch (err) {
      console.error('Reject failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <p className={profileStyles.fieldLabel}>Сообщение студенту (почему профиль не прошёл проверку)</p>
      <textarea
        className={profileStyles.messageInput}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        aria-label="Сообщение студенту"
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className={adminStyles.reportBtn} onClick={handleApprove} disabled={loading}>
          {loading ? 'Обработка...' : 'Одобрить'}
        </button>
        <button className={adminStyles.reportBtnDanger} onClick={handleReject} disabled={loading || !comment.trim()}>
          {loading ? 'Обработка...' : 'Отправить сообщение и отклонить'}
        </button>
      </div>
    </div>
  );
}
