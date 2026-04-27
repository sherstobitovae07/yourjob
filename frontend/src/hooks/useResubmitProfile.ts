import { useState } from 'react';
import { studentProfileService } from '../services/studentProfileService';

export function useResubmitProfile() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await studentProfileService.submitForVerification();
    } catch (err: any) {
      console.error('Failed to resubmit profile:', err);
      setError(err?.message || 'Не удалось отправить профиль на проверку');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, submit };
}
