import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyEmployerProfilePage from '@/app/profile/employer/page';

jest.mock('@/services/employerProfileService', () => ({
  employerProfileService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadPhoto: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

describe('Employer INN validation', () => {
  const { employerProfileService } = require('@/services/employerProfileService');

  beforeEach(() => jest.clearAllMocks());

  // Сценарий 1: пользователь вводит ИНН неправильной длины -> ошибка, запрос не уходит
  it('shows error and does not send request for invalid-length INN', async () => {
    employerProfileService.getProfile.mockResolvedValue({
      first_name: 'Test',
      last_name: 'User',
      email: 't@example.com',
      company_name: 'Co',
      inn: '',
    });

    const { getByText, getByLabelText } = render(<MyEmployerProfilePage />);

    // дождёмся загрузки профиля
    await waitFor(() => expect(employerProfileService.getProfile).toHaveBeenCalled());

    // Перейти в режим редактирования
    fireEvent.click(getByText(/Редактировать/i));

    // Некоторые лейблы в коде не связаны через htmlFor — используем queryByLabelText с fallback
    const innInput = screen.queryByLabelText(/ИНН компании/i) as HTMLInputElement | null || document.querySelector('input[name="inn"]') as HTMLInputElement | null;
    expect(innInput).not.toBeNull();
    // Вводим короткий некорректный ИНН
    if (innInput) fireEvent.change(innInput, { target: { value: '123' } });

    fireEvent.click(getByText(/Сохранить/i));

    // Ожидаем, что появится сообщение об ошибке и updateProfile НЕ вызывался
    await waitFor(() => expect(screen.getByText(/Некорректный ИНН/i)).toBeInTheDocument());
    expect(employerProfileService.updateProfile).not.toHaveBeenCalled();
  });

  // Сценарий 2: ИНН проходит базовую клиентскую проверку -> данные сохраняются, запрос отправляется
  it('sends update request when INN is valid', async () => {
    employerProfileService.getProfile.mockResolvedValue({
      first_name: 'Test',
      last_name: 'User',
      email: 't@example.com',
      company_name: 'Co',
      inn: '',
    });
    employerProfileService.updateProfile.mockResolvedValue({
      first_name: 'Test',
      last_name: 'User',
      email: 't@example.com',
      company_name: 'Co',
      inn: '1234567890',
      verification_status: 'PENDING',
    });

    const { getByText } = render(<MyEmployerProfilePage />);
    await waitFor(() => expect(employerProfileService.getProfile).toHaveBeenCalled());
    fireEvent.click(getByText(/Редактировать/i));

    const innInput = document.querySelector('input[name="inn"]') as HTMLInputElement;
    fireEvent.change(innInput, { target: { value: '1234567890' } });

    fireEvent.click(getByText(/Сохранить/i));

    await waitFor(() => expect(employerProfileService.updateProfile).toHaveBeenCalled());
    // после успешного ответа компонент должен отобразить статус PENDING
    await waitFor(() => expect(screen.getByText(/Аккаунт ожидает одобрения/i)).toBeInTheDocument());
  });

  // Сценарий 3: после получения данных отображается статус проверки (например, APPROVED/REJECTED/PENDING)
  it('displays verification status after update', async () => {
    employerProfileService.getProfile.mockResolvedValue({
      first_name: 'T',
      last_name: 'U',
      email: 't@u',
      company_name: 'C',
      inn: '1234567890',
      verification_status: 'APPROVED',
    });
    const { getByText } = render(<MyEmployerProfilePage />);
    await waitFor(() => expect(employerProfileService.getProfile).toHaveBeenCalled());
    // Статус APPROVED отображается как 'Аккаунт одобрен'
    expect(screen.getByText(/Аккаунт одобрен/i)).toBeInTheDocument();
  });
});
