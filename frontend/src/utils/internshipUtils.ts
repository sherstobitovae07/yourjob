export const getInternshipImage = (title?: string | null): string => {
  const normalizedTitle = title?.toLowerCase() ?? '';

  if (
    normalizedTitle.includes('организации мероприятий') ||
    normalizedTitle.includes('event') ||
    normalizedTitle.includes('мероприятий')
  ) {
    return '/218c9170682e8d1ec7c3a10d28e21663.webp';
  }

  if (
    normalizedTitle.includes('логистик') ||
    normalizedTitle.includes('supply chain') ||
    normalizedTitle.includes('поставок')
  ) {
    return '/logistika-ecommerce-tehnologii-ii-optimizaciya-protsessov.jpg';
  }

  if (
    normalizedTitle.includes('hr') ||
    normalizedTitle.includes('рекрутинг') ||
    normalizedTitle.includes('hr-менеджер')
  ) {
    return '/1794_min.jpg';
  }

  if (
    normalizedTitle.includes('финансов') ||
    normalizedTitle.includes('financial') ||
    normalizedTitle.includes('аналитик')
  ) {
    return '/aaxfo4qgf6plgcbknpu13xkuon6dd8qd.jpg';
  }

  if (
    normalizedTitle.includes('digital') ||
    normalizedTitle.includes('маркет') ||
    normalizedTitle.includes('marketing')
  ) {
    return '/iStock-1332570157.jpg';
  }

  if (normalizedTitle.includes('backend') || normalizedTitle.includes('backend-разработчик')) {
    return '/backend-developer.jpeg';
  }

  return '/image.jpg';
};

export const parseDateFromString = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
};

export const formatRuDate = (date?: Date | string | null): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getFirstSentence = (text?: string | null): string => {
  if (!text) return '';
  const match = text.match(/[^.!?]+[.!?]+/);
  return match ? match[0] : text.substring(0, 100) + '...';
};

export const formatStatus = (status?: string | null): string => {
  if (!status) return 'Неизвестно';
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Активна',
    'CLOSED': 'Закрыта',
    'ARCHIVED': 'Архив',
    'PENDING': 'На рассмотрении',
    'APPROVED': 'Одобрено',
    'REJECTED': 'Отклонено',
  };
  return statusMap[status] || status;
};
