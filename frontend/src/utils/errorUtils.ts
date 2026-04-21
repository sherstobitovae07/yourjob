import axios from 'axios';

const formatAxiosErrors = (detail: unknown): string | null => {
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object') {
          return Object.values(item)
            .flat()
            .map((value) => String(value))
            .join(', ');
        }
        return String(item);
      })
      .join(', ');
  }
  if (detail && typeof detail === 'object' && 'msg' in detail) {
    return String((detail as { msg?: unknown }).msg ?? '');
  }
  return null;
};

export const getHttpErrorMessage = (error: unknown, defaultMessage = 'Произошла ошибка'): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) {
      return 'Требуется авторизация. Пожалуйста, войдите в систему.';
    }
    if (status === 403) {
      return 'У вас нет прав доступа к этому разделу.';
    }
    if (status === 404) {
      return 'Сущность не найдена.';
    }
    if (status === 422) {
      return 'Неверные данные запроса. Проверьте ввод и попробуйте снова.';
    }
    const detailMessage = formatAxiosErrors(error.response?.data?.detail ?? error.response?.data);
    if (detailMessage) {
      return detailMessage;
    }
    if (typeof error.message === 'string') {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};
