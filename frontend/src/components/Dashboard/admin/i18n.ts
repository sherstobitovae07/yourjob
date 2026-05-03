'use client';

// Minimal i18n provider for react-admin (Russian)
// Provides translate(key, options) and locale management

type Messages = Record<string, any>;

const messages: Messages = {
  ra: {
    action: {
      add: 'Добавить',
      edit: 'Редактировать',
      show: 'Показать',
      list: 'Список',
      save: 'Сохранить',
      create: 'Создать',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      reset: 'Сброс',
      export: 'Экспорт',
      search: 'Поиск',
      clear_input_value: 'Очистить',
      refresh: 'Обновить',
      login: 'Войти',
      logout: 'Выйти',
      undo: 'Отменить',
      bulk_actions: 'Массовые действия',
      delete: 'Удалить',
      go_back: 'Назад',
    },
    boolean: {
      true: 'Да',
      false: 'Нет',
      null: ' ',
    },
    page: {
      list: 'Список',
      edit: 'Редактирование',
      show: 'Просмотр',
      create: 'Создание',
      dashboard: 'Панель администратора',
      error: 'Что-то пошло не так',
    },
    sort: {
      sort_by: 'Сортировать по %{field} %{order}',
      ASC: 'по возрастанию',
      DESC: 'по убыванию',
    },
    input: {
      file: {
        upload_several: 'Перетащите файлы сюда для загрузки, или кликните для выбора.',
        upload_single: 'Перетащите файл сюда для загрузки, или кликните для выбора.',
      },
      image: {
        upload_several: 'Перетащите изображения сюда для загрузки, или кликните для выбора.',
        upload_single: 'Перетащите изображение сюда для загрузки, или кликните для выбора.',
      },
      references: {
        all_missing: 'Связанные данные не найдены.',
        many_missing: 'Некоторые связанные данные не найдены.',
        single_missing: 'Связанные данные не найдены.',
      },
    },
    message: {
      yes: 'Да',
      no: 'Нет',
    },
    navigation: {
      no_results: 'Результатов не найдено',
      page_rows_per_page: 'строк на странице',
      page_range_info: '%{offsetBegin} - %{offsetEnd} из %{total}',
      partial_page_range_info: '%{offsetBegin} - %{offsetEnd} из более %{offsetEnd}',
    },
    notification: {
      updated: 'Обновлено успешно',
      created: 'Создано успешно',
      deleted: 'Удалено',
      bad_item: 'Неверный элемент',
      item_doesnt_exist: 'Элемент не существует',
      http_error: 'Ошибка сети',
      data_provider_error: 'Ошибка источника данных',
      canceled: 'Отменено',
      logged_out: 'Сессия завершена, пожалуйста, войдите снова',
    },
    validation: {
      required: 'Обязательно',
      minLength: 'Минимальная длина: %{min}',
      maxLength: 'Максимальная длина: %{max}',
      minValue: 'Минимальное значение: %{min}',
      maxValue: 'Максимальное значение: %{max}',
      number: 'Должно быть числом',
      email: 'Неверный email',
    },
  },
    resources: {
    users: {
      name: 'Пользователи',
      fields: {
        id: 'ID',
        first_name: 'Имя',
        last_name: 'Фамилия',
        email: 'Email',
        role: 'Роль',
        created_at: 'Создано',
      },
    },
    employers: {
      name: 'Работодатели',
      fields: {
        id: 'ID',
        company_name: 'Компания',
        email: 'Email',
        created_at: 'Создано',
      },
    },
    students: {
      name: 'Студенты',
      fields: {
        id: 'ID',
        first_name: 'Имя',
        last_name: 'Фамилия',
        email: 'Email',
        created_at: 'Создано',
      },
    },
    internships: {
      name: 'Стажировки',
      fields: {
        id: 'ID',
        title: 'Название',
        company_name: 'Компания',
        applications_count: 'Откликов',
        status: 'Статус',
        deadline: 'Дедлайн',
      },
    },
    applications: {
      name: 'Отклики',
      fields: {
        id: 'ID',
        student_name: 'Студент',
        internship_id: 'Стажировка (ID)',
        created_at: 'Создано',
      },
    },
    articles: {
      name: 'Статьи',
      fields: {
        id: 'ID',
        title: 'Заголовок',
        author_name: 'Автор',
        published: 'Опубликована',
        created_at: 'Создано',
      },
    },
    reports: {
      name: 'Отчёты',
      fields: {
        id: 'ID',
        label: 'Название',
        created_at: 'Создано',
      },
    },
  },
};

// Ensure common RA keys exist (no overrides with different placeholders)
messages.ra.action.bulk_actions = messages.ra.action.bulk_actions || 'Массовые действия';
messages.ra.action.delete = messages.ra.action.delete || 'Удалить';

let locale = 'ru';

function getMessage(key: string, opts?: Record<string, any>) {
  const parts = key.split('.');
  let cur: any = messages;
  for (const p of parts) {
    cur = cur?.[p];
    if (cur === undefined) return key;
  }
  if (typeof cur === 'string') {
    if (opts) {
      return cur.replace(/%\{(.*?)\}/g, (_m, k) => String(opts[k] ?? ''));
    }
    return cur;
  }
  return key;
}

export const i18nProvider = {
  translate: (key: string, options?: Record<string, any>) => getMessage(key, options),
  changeLocale: (newLocale: string) => {
    locale = newLocale;
    return Promise.resolve();
  },
  getLocale: () => locale,
};

export default i18nProvider;
