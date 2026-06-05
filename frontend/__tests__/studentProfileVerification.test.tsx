import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MyStudentProfilePage from '@/app/profile/student/page';

// Тесты для страницы профиля студента: проверяем визуальные элементы
// и доступность кнопки повторной отправки на проверку в зависимости от
// значения `verification_status` в профиле.

jest.mock('@/services/studentProfileService', () => ({
  studentProfileService: {
    getProfile: jest.fn(),
    uploadPhoto: jest.fn(),
    uploadResume: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

describe('Student profile verification UI', () => {
  const { studentProfileService } = require('@/services/studentProfileService');

  beforeEach(() => jest.clearAllMocks());

  // Тест: при статусе APPROVED отображается бейдж "Аккаунт одобрен",
  // кнопки повторной отправки не должно быть.
  it('shows approved badge and no resubmit button for APPROVED', async () => {
    studentProfileService.getProfile.mockResolvedValue({
      first_name: 'Ivan',
      last_name: 'Petrov',
      email: 'i@p.test',
      verification_status: 'APPROVED',
    });
    render(<MyStudentProfilePage />);
    await waitFor(() => expect(studentProfileService.getProfile).toHaveBeenCalled());
    expect(screen.getByText(/Аккаунт одобрен/i)).toBeInTheDocument();
    expect(screen.queryByText(/Отправить на повторную проверку/i)).not.toBeInTheDocument();
  });

  // Тест: при статусе PENDING отображается бейдж ожидания, кнопка повторной
  // отправки также не доступна.
  it('shows pending badge and no resubmit button for PENDING', async () => {
    studentProfileService.getProfile.mockResolvedValue({
      first_name: 'A',
      last_name: 'B',
      email: 'a@b',
      verification_status: 'PENDING',
    });
    render(<MyStudentProfilePage />);
    await waitFor(() => expect(studentProfileService.getProfile).toHaveBeenCalled());
    expect(screen.getByText(/Аккаунт ожидает одобрения/i)).toBeInTheDocument();
    expect(screen.queryByText(/Отправить на повторную проверку/i)).not.toBeInTheDocument();
  });

  // Тест: при статусе REJECTED показывается бейдж с причиной (если есть)
  // и видна кнопка 'Отправить на повторную проверку'.
  it('shows rejected badge and resubmit button when REJECTED', async () => {
    studentProfileService.getProfile.mockResolvedValue({
      first_name: 'X',
      last_name: 'Y',
      email: 'x@y',
      verification_status: 'REJECTED',
      verification_comment: 'bad',
    });
    render(<MyStudentProfilePage />);
    await waitFor(() => expect(studentProfileService.getProfile).toHaveBeenCalled());
    expect(screen.getByText(/Аккаунт отклонен/i)).toBeInTheDocument();
    expect(screen.getByText(/Отправить на повторную проверку/i)).toBeInTheDocument();
  });
});
