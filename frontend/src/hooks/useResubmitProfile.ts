import { useState } from 'react';
import axios from 'axios';
import { studentProfileService } from '../services/studentProfileService';
import { employerProfileService } from '../services/employerProfileService';
import { getStoredUserRole } from '@/utils/authHelper';

export function useResubmitProfile() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const role = getStoredUserRole();
      if (role === 'EMPLOYER') {
        // fetch employer profile and validate required fields client-side
        const profile = await employerProfileService.getProfile();
        if (!profile.company_name || !profile.description || !profile.website || !profile.inn) {
          const missing = [] as string[];
          if (!profile.company_name) missing.push('название компании');
          if (!profile.description) missing.push('описание компании');
          if (!profile.website) missing.push('сайт компании');
          if (!profile.inn) missing.push('ИНН');
          const msg = `Заполните: ${missing.join(', ')}`;
          setError(msg);
          throw new Error(msg);
        }

        const validateInn = (inn: string | null | undefined): boolean => {
          if (!inn) return false;
          if (!/^[0-9]+$/.test(inn)) return false;
          const digits = inn.split('').map(d => parseInt(d, 10));
          if (inn.length === 10) {
            const coeffs = [2,4,10,3,5,9,4,6,8];
            const control = coeffs.reduce((sum, c, i) => sum + c * digits[i], 0) % 11 % 10;
            return control === digits[9];
          }
          if (inn.length === 12) {
            const coeffs1 = [7,2,4,10,3,5,9,4,6,8];
            const control1 = coeffs1.reduce((sum, c, i) => sum + c * digits[i], 0) % 11 % 10;
            const coeffs2 = [3,7,2,4,10,3,5,9,4,6,8];
            const control2 = coeffs2.reduce((sum, c, i) => sum + c * digits[i], 0) % 11 % 10;
            return control1 === digits[10] && control2 === digits[11];
          }
          return false;
        };

        if (!validateInn(profile.inn)) {
          const msg = 'Некорректный ИНН';
          setError(msg);
          throw new Error(msg);
        }

        await employerProfileService.submitForVerification();
      } else {
        await studentProfileService.submitForVerification();
      }
    } catch (err: any) {
      console.error('Failed to resubmit profile:', err);
      // Try to extract backend error message
      let msg = 'Не удалось отправить профиль на проверку';
      if (axios.isAxiosError(err)) {
        const det = err.response?.data?.detail ?? err.response?.data ?? err.message;
        if (typeof det === 'string') msg = det;
        else if (Array.isArray(det)) msg = det.map(d => (d?.msg ?? JSON.stringify(d))).join(', ');
        else if (typeof det === 'object') msg = JSON.stringify(det);
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, submit };
}
