/**
 * Тесты для компонента фильтров стажировок.

 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

// Используем алиас `@/` который в jest.config.cjs настроен на <rootDir>/src
import InternshipListWithFilters from '@/components/internship/InternshipListWithFilters';

// Мокаем dashboardService чтобы избежать сетевых запросов в тестах.
jest.mock('@/services/dashboardService', () => ({
  dashboardService: {
    getActiveInternships: jest.fn().mockResolvedValue([]),
  }
}));

// Импортируем мокированный сервис для проверки вызовов
import { dashboardService } from '@/services/dashboardService';
const mockedGet = (dashboardService.getActiveInternships as jest.MockedFunction<any>);

describe('InternshipListWithFilters — поведение дровера фильтров', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('при открытии дровера поле поиска должно быть предзаполнено из initialQ', async () => {
    // Рендерим компонент с начальными параметрами поиска, оборачиваем в act
    await act(async () => {
      render(<InternshipListWithFilters initialQ="тестовая строка" />);
    });

    // На странице есть кнопка открытия фильтров — внутри неё находится <img alt="filters">
    const img = screen.getByAltText('filters');
    const btn = img.closest('button');
    expect(btn).toBeTruthy();

    // Кликаем по кнопке и ожидаем, что поле модального поиска появится и будет содержать initialQ
    await act(async () => {
      await userEvent.click(btn as Element);
    });

    // Найдём все элементы с плейсхолдером 'Поиск...' и выберем тот, который относится к дроверу
    const inputs = await screen.findAllByPlaceholderText('Поиск...');
    // выбираем элемент с классом 'input' (это поле внутри дровера), а не главный searchInputCustom
    const modalInput = inputs.find((el) => el.classList.contains('input')) as HTMLInputElement | undefined;
    await waitFor(() => expect(modalInput).toBeDefined());
    expect(modalInput).toBeInTheDocument();
    expect(modalInput!.value).toBe('тестовая строка');
  });

  it('applyFilters вызывает getActiveInternships с корректными фильтрами', async () => {
    mockedGet.mockResolvedValueOnce([]);
    await act(async () => {
      render(<InternshipListWithFilters initialQ="qstr" />);
    });

    const img = screen.getByAltText('filters');
    const btn = img.closest('button') as Element;
    await act(async () => {
      await userEvent.click(btn);
    });

    // дождёмся появления модального окна и полей
    const allSearches = await screen.findAllByPlaceholderText('Поиск...');
    const modalSearch = allSearches.find((el) => el.classList.contains('input'));
    expect(modalSearch).toBeDefined();
    const region = await screen.findByPlaceholderText('Поиск региона');
    await act(async () => {
      await userEvent.type(region, 'РегионX');
      const prof = await screen.findByPlaceholderText('Поиск профессии');
      await userEvent.type(prof, 'Программист');
      const from = await screen.findByPlaceholderText('От');
      await userEvent.type(from, '30000');
      const to = await screen.findByPlaceholderText('До');
      await userEvent.type(to, '60000');

      // Нажимаем показать вакансии
      const showBtn = screen.getByRole('button', { name: /Показать вакансии/i });
      await userEvent.click(showBtn);
    });

    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith({ q: 'qstr', city: 'РегионX', direction: 'Программист', min_salary: 30000, max_salary: 60000 });
    });
  });

  it('рендерит карточку стажировки, если сервис возвращает данные', async () => {
    const item = [{ id: 1, title: 'Тестовая стажировка', description: 'описание', salary: 45000, city: 'Город', company_name: 'Компания', deadline: '2026-12-25T00:00:00Z', created_at: '2026-01-01T00:00:00Z' }];
    mockedGet.mockResolvedValueOnce(item);

    await act(async () => {
      render(<InternshipListWithFilters initialQ="" />);
    });

    const card = await screen.findByText('Тестовая стажировка');
    expect(card).toBeInTheDocument();
    expect(screen.getByText('45000 ₽/мес')).toBeInTheDocument();
  });
});
