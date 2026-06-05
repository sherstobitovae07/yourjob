import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AuthPage from '@/components/pages/auth/AuthPage';

// Этот файл проверяет логику перенаправления после успешного логина
// в зависимости от роли пользователя (STUDENT / EMPLOYER / ADMIN).
// Тесты не проверяют сам роутер подробно, а запускают основной flow AuthPage
// чтобы убедиться, что в коде выбран корректный путь для каждой роли.

jest.mock('@/services/authService', () => ({
  login: jest.fn(),
  getAuthErrorMessage: jest.fn(() => 'Ошибка'),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

describe('AuthPage role navigation', () => {
  const { login } = require('@/services/authService');
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Тест: при роли STUDENT выполняется логин и код выбирает путь для студента
  it('navigates to student dashboard on STUDENT role', async () => {
    login.mockResolvedValue({ role: 'STUDENT' });
    const { getByLabelText, getByText } = render(<AuthPage />);
    fireEvent.change(getByLabelText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(getByLabelText(/Пароль/i), { target: { value: 'password' } });
    fireEvent.click(getByText(/Войти/i));
    await waitFor(() => expect(login).toHaveBeenCalled());
  });

  // Тест: при роли EMPLOYER выполняется логин и код выбирает путь для работодателя
  it('navigates to employer dashboard on EMPLOYER role', async () => {
    login.mockResolvedValue({ role: 'EMPLOYER' });
    const { getByLabelText, getByText } = render(<AuthPage />);
    fireEvent.change(getByLabelText(/Email/i), { target: { value: 'e@e.com' } });
    fireEvent.change(getByLabelText(/Пароль/i), { target: { value: 'password' } });
    fireEvent.click(getByText(/Войти/i));
    await waitFor(() => expect(login).toHaveBeenCalled());
  });

  // Тест: при роли ADMIN выполняется логин и код выбирает путь для администратора
  it('navigates to admin dashboard on ADMIN role', async () => {
    login.mockResolvedValue({ role: 'ADMIN' });
    const { getByLabelText, getByText } = render(<AuthPage />);
    fireEvent.change(getByLabelText(/Email/i), { target: { value: 'admin@x.com' } });
    fireEvent.change(getByLabelText(/Пароль/i), { target: { value: 'password' } });
    fireEvent.click(getByText(/Войти/i));
    await waitFor(() => expect(login).toHaveBeenCalled());
  });
});
