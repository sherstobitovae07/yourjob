import { AdminUser, AdminEmployer } from '../types/admin';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Не указана';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getFullName = (firstName: string | null, lastName: string | null): string => {
  const parts = [];
  if (firstName) parts.push(firstName);
  if (lastName) parts.push(lastName);
  return parts.length > 0 ? parts.join(' ') : 'Не указано';
};

export const getRoleBadgeClass = (role: string): string => {
  const roleMap: Record<string, string> = {
    ADMIN: 'badgeAdmin',
    STUDENT: 'badgeStudent',
    EMPLOYER: 'badgeEmployer',
  };
  return roleMap[role] || '';
};

export const getRoleDisplay = (role: string): string => {
  const roleMap: Record<string, string> = {
    ADMIN: 'Администратор',
    STUDENT: 'Студент',
    EMPLOYER: 'Работодатель',
  };
  return roleMap[role] || role;
};

export const sortUsers = (users: AdminUser[], sortBy: keyof AdminUser = 'created_at'): AdminUser[] => {
  return [...users].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return bValue.localeCompare(aValue);
    }

    return 0;
  });
};

export const sortEmployers = (
  employers: AdminEmployer[],
  sortBy: keyof AdminEmployer = 'created_at'
): AdminEmployer[] => {
  return [...employers].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return bValue.localeCompare(aValue);
    }

    return 0;
  });
};

export const filterUsers = (users: AdminUser[], searchTerm: string): AdminUser[] => {
  const term = searchTerm.toLowerCase();
  return users.filter(
    (user) =>
      user.email.toLowerCase().includes(term) ||
      (user.first_name && user.first_name.toLowerCase().includes(term)) ||
      (user.last_name && user.last_name.toLowerCase().includes(term))
  );
};

export const filterEmployers = (employers: AdminEmployer[], searchTerm: string): AdminEmployer[] => {
  const term = searchTerm.toLowerCase();
  return employers.filter(
    (employer) =>
      (employer.email && employer.email.toLowerCase().includes(term)) ||
      (employer.first_name && employer.first_name.toLowerCase().includes(term)) ||
      (employer.last_name && employer.last_name.toLowerCase().includes(term)) ||
      (employer.company_name && employer.company_name.toLowerCase().includes(term))
  );
};
