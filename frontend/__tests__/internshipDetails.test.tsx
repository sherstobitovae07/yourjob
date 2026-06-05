import React from 'react';
import { render, screen } from '@testing-library/react';
import InternshipDetailsModal from '@/components/internship/InternshipDetailsModal';

// Тесты для модального окна с информацией о стажировке.
// Проверяем поведение статуса и видимость кнопки отклика в зависимоти от статуса и сроков.

describe('InternshipDetailsModal status behavior', () => {
  const baseInternship = {
    id: 1,
    title: 'Test Internship',
    description: 'Desc',
    status: 'ACTIVE',
    deadline: null,
  } as any;

  // Тест: если статус ACTIVE и дедлайн в будущем, показываем кнопку "Откликнуться"
  it('shows apply button for ACTIVE and not expired', () => {
    const onClose = jest.fn();
    const onApply = jest.fn();
    render(<InternshipDetailsModal internship={{ ...baseInternship, status: 'ACTIVE', deadline: '2999-12-31' }} onClose={onClose} onApply={onApply} />);
    expect(screen.getByText(/Откликнуться/i)).toBeInTheDocument();
  });

  // Тест: если статус CLOSED или дедлайн прошёл — показываем метку "ЗАКРЫТА"
  // и скрываем кнопку отклика.
  it('shows closed badge and no apply button for CLOSED', () => {
    const onClose = jest.fn();
    const onApply = jest.fn();
    render(<InternshipDetailsModal internship={{ ...baseInternship, status: 'CLOSED', deadline: '2000-01-01' }} onClose={onClose} onApply={onApply} />);
    expect(screen.getByText(/ЗАКРЫТА/i)).toBeInTheDocument();
    expect(screen.queryByText(/Откликнуться/i)).not.toBeInTheDocument();
  });
});
