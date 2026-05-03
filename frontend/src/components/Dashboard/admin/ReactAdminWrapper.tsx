"use client";
import React from 'react';
import { Admin, Resource, List, Datagrid, TextField, EmailField, NumberField, DateField, Layout, Menu, useSidebarState, useListContext, BulkDeleteButton } from 'react-admin';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import styles from '@/styles/components/admin.module.css';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/authService';
import { adminService } from '@/services/adminService';
import { EmployersList as EmployersListView } from './EmployersList';
import { StudentsList as StudentsListView } from './StudentsList';
import { UsersList as UsersListView } from './UsersList';
import { ReportsList as ReportsListView } from '../ReportsList';
import { articleService } from '@/services/articleService';
import { formatDate } from '@/utils/adminUtils';
import DeleteInternshipModal from './DeleteInternshipModal';
import DeleteUserModal from './DeleteUserModal';
import DeleteApplicationModal from './DeleteApplicationModal';
import AdminArticlesList from './ArticlesList';
import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'ra-core';
import { i18nProvider } from './i18n';
import { getCookie } from '../../../utils/cookies';
import { ACCESS_TOKEN_COOKIE } from '../../../constants/auth';

// Use relative admin path so Next.js rewrites() can proxy to backend in dev
const adminBase = process.env.NEXT_PUBLIC_ADMIN_API || '/admin';

const httpClient = (url: string, options: any = {}) => {
  options.headers = options.headers || new Headers({ Accept: 'application/json' });
  const token = getCookie(ACCESS_TOKEN_COOKIE);
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  return fetchUtils.fetchJson(url, options);
};

const baseProvider = simpleRestProvider(adminBase, httpClient);

// Wrap provider to handle missing Content-Range and 404 for lists
const dataProvider = {
  ...baseProvider,
  getList: async (resource: string, params: any) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: 'id', order: 'DESC' };
    const _start = (page - 1) * perPage;
    const _end = page * perPage;

    const filter = params.filter || {};
    const filterQs = Object.keys(filter)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(filter[k])}`)
      .join('&');

    const url = `${adminBase}/${resource}?_start=${_start}&_end=${_end}&_sort=${encodeURIComponent(
      field
    )}&_order=${encodeURIComponent(order)}${filterQs ? `&${filterQs}` : ''}`;

    try {
      const { json, headers } = await httpClient(url);
      const contentRange = headers?.get?.('content-range') || headers?.get?.('Content-Range');
      let total = 0;
      if (contentRange) {
        const parts = contentRange.split('/');
        total = parts.length === 2 ? parseInt(parts[1], 10) || (Array.isArray(json) ? json.length : 0) : (Array.isArray(json) ? json.length : 0);
      } else {
        total = Array.isArray(json) ? json.length : json?.length ?? 0;
      }
      const data = Array.isArray(json) ? json : json?.data ?? [];
      return { data, total };
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 404) return { data: [], total: 0 };
      throw err;
    }
  },
};

const UsersInner = (props: any) => {
  const { total, ids, data, filterValues, setFilters, setPage } = useListContext();
  const [searchText, setSearchText] = React.useState<string>(filterValues?.q ?? '');

  // debounce typing to avoid spamming requests and reset to page 1
  React.useEffect(() => {
    const t = setTimeout(() => {
      setFilters({ ...filterValues, q: searchText });
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchText]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Normalize records: react-admin may provide `data` as array or object map
  let records: any[] = [];
  if (Array.isArray(data)) {
    records = data;
  } else if (ids && data) {
    records = (ids || []).map((id: any) => data[id]).filter(Boolean);
  }

  const q = (searchText || '').toLowerCase().trim();
  let clientFiltered: any[] | null = null;
  if (q && records.length > 0) {
    clientFiltered = records.filter((r: any) => {
      if (!r) return false;
      return [String(r.id), r.first_name, r.last_name, r.email, r.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }

  return (
    <>
      <h3 className={styles.sectionTitle}>Пользователи ({total ?? (ids ? ids.length : 0)})</h3>
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          placeholder="Поиск..."
          value={searchText}
          onChange={handleSearch}
        />
      </div>

      {q ? (
        clientFiltered && clientFiltered.length > 0 ? (
          <div className={styles.responsive}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>ID</th>
                  <th className={styles.tableHeaderCell}>Имя</th>
                  <th className={styles.tableHeaderCell}>Фамилия</th>
                  <th className={styles.tableHeaderCell}>Email</th>
                  <th className={styles.tableHeaderCell}>Роль</th>
                  <th className={styles.tableHeaderCell}>Создано</th>
                </tr>
              </thead>
              <tbody>
                {clientFiltered.map((r: any) => (
                  <tr key={r.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{r.id}</td>
                    <td className={styles.tableCell}>{r.first_name}</td>
                    <td className={styles.tableCell}>{r.last_name}</td>
                    <td className={styles.tableCell}><a href={`mailto:${r.email}`}>{r.email}</a></td>
                    <td className={styles.tableCell}>{r.role}</td>
                    <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateText}>Ничего не найдено</div>
          </div>
        )
      ) : (
        <div className={styles.responsive}>
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="first_name" />
            <TextField source="last_name" />
            <EmailField source="email" />
            <TextField source="role" />
            <DateField source="created_at" />
          </Datagrid>
        </div>
      )}
    </>
  );
};

const UsersList = (props: any) => (
  <List {...props} title="Пользователи" bulkActionButtons={<BulkDeleteButton />} exporter={false}>
    <SectionWrapper>
      <UsersInner />
    </SectionWrapper>
  </List>
);

// Wrapper must be a React component so react-admin can pass list props to it
// without React forwarding unknown props to a DOM element (which causes warnings).
function SectionWrapper({ children }: any) {
  return <div className={styles.section}>{children}</div>;
}

const InternshipsList = (props: any) => (
  <List {...props} title="Стажировки" exporter={false}>
    <InternshipsInner />
  </List>
);

const InternshipsInner = (props: any) => {
  const { total } = useListContext();
  return (
    <>
      <h3 className={styles.sectionTitle}>Стажировки ({total ?? 0})</h3>
      <div className={styles.responsive}>
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="title" />
          <TextField source="company_name" />
          <NumberField source="applications_count" />
          <TextField source="status" />
          <DateField source="deadline" />
        </Datagrid>
      </div>
    </>
  );
};

const ApplicationsList = (props: any) => (
  <List {...props} title="Отклики" exporter={false}>
    <ApplicationsInner />
  </List>
);

const ApplicationsInner = (props: any) => {
  const { total } = useListContext();
  return (
    <>
      <h3 className={styles.sectionTitle}>Отклики ({total ?? 0})</h3>
      <div className={styles.responsive}>
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="student_name" />
          <TextField source="internship_id" />
          <DateField source="created_at" />
        </Datagrid>
      </div>
    </>
  );
};

const ArticlesList = (props: any) => (
  <List {...props} title="Статьи" exporter={false}>
    <ArticlesInner />
  </List>
);

const ArticlesInner = (props: any) => {
  const { total } = useListContext();
  return (
    <>
      <h3 className={styles.sectionTitle}>Статьи ({total ?? 0})</h3>
      <div className={styles.responsive}>
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="title" />
          <TextField source="author_name" />
          <TextField source="published" />
          <DateField source="created_at" />
        </Datagrid>
      </div>
    </>
  );
};

export default function ReactAdminWrapper() {
  const MyAppBar = (props: any) => {
    const [open, setOpen] = useSidebarState();
    const router = useRouter();
    const [section, setSection] = React.useState<string>('');

    const lookupLabel = (key: string) => {
      const map: Record<string, string> = {
        users: 'Пользователи',
        employers: 'Панель работодателя',
        internships: 'Стажировки',
        applications: 'Отклики',
        articles: 'Статьи',
      };
      return map[key] ?? '';
    };

    const updateSectionFromUrl = () => {
      if (typeof window === 'undefined') return;
      let key = '';
      const hash = window.location.hash || '';
      if (hash.startsWith('#/')) {
        key = hash.slice(2).split('/')[0];
      } else {
        const parts = window.location.pathname.split('/').filter(Boolean);
        const adminIdx = parts.indexOf('admin');
        if (adminIdx >= 0 && parts.length > adminIdx + 1) key = parts[adminIdx + 1];
      }
      setSection(lookupLabel(key));
    };

    React.useEffect(() => {
      updateSectionFromUrl();
      const onHash = () => updateSectionFromUrl();
      window.addEventListener('hashchange', onHash);
      window.addEventListener('popstate', onHash);
      return () => {
        window.removeEventListener('hashchange', onHash);
        window.removeEventListener('popstate', onHash);
      };
    }, []);

    return (
      <MuiAppBar position="fixed" sx={{ backgroundColor: '#06283D', top: 0, left: 0, right: 0, zIndex: 1400 }}>
        <Toolbar sx={{ minHeight: 80, alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(!open)}
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Панель работодателя
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <button
              className={styles.refreshBtn}
              onClick={() => window.location.reload()}
            >
              Обновить
            </button>
            <button
              className={styles.logoutBtn}
              onClick={() => {
                logout();
                router.push('/auth');
              }}
            >
              Выйти
            </button>
          </Box>
        </Toolbar>
      </MuiAppBar>
    );
  };

    const MyMenu = (props: any) => (
    <Menu
      {...props}
      sx={{
        // keep the drawer positioned within the layout (don't force fixed overlay)
        '& .MuiDrawer-paper': { position: 'relative', top: 0 },
        '& .MuiDrawer-root': { position: 'relative' },
        // ensure backdrop (temporary drawer) sits below AppBar if used
        '& .MuiBackdrop-root': { top: 80 },
      }}
    />
  );

  const MyLayout = (props: any) => <Layout {...props} appBar={MyAppBar} menu={MyMenu} />;

  // User delete modal state + event listener for simple list wrappers
  const [deleteUserOpen, setDeleteUserOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  React.useEffect(() => {
    const handler = (e: any) => {
      setSelectedUserId(e.detail?.userId ?? null);
      setDeleteUserOpen(true);
    };
    window.addEventListener('admin:open-delete-user', handler);
    return () => window.removeEventListener('admin:open-delete-user', handler);
  }, []);

  // Application delete modal state (for admin lists)
  const [deleteApplicationOpen, setDeleteApplicationOpen] = React.useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = React.useState<number | null>(null);
  React.useEffect(() => {
    const h = (e: any) => {
      setSelectedApplicationId(e.detail?.applicationId ?? null);
      setDeleteApplicationOpen(true);
    };
    window.addEventListener('admin:open-delete-application', h);
    return () => window.removeEventListener('admin:open-delete-application', h);
  }, []);

  return (
    <div style={{ padding: 0, paddingTop: 16 }}>
      <Admin dataProvider={dataProvider} disableTelemetry={true} layout={MyLayout} i18nProvider={i18nProvider}>
        <Resource name="users" list={UsersWrapper} options={{ label: 'Пользователи' }} />
        <Resource name="employers" list={EmployersWrapper} options={{ label: 'Работодатели' }} />
        <Resource name="students" list={StudentsWrapper} options={{ label: 'Студенты' }} />
        <Resource name="internships" list={InternshipsWrapper} options={{ label: 'Стажировки' }} />
        <Resource name="applications" list={ApplicationsWrapper} options={{ label: 'Отклики' }} />
        <Resource name="articles" list={ArticlesWrapper} options={{ label: 'Статьи' }} />
        <Resource name="reports" list={ReportsWrapper} options={{ label: 'Отчёты' }} />
      </Admin>
      <DeleteUserModal
        open={deleteUserOpen}
        onClose={() => setDeleteUserOpen(false)}
        userId={selectedUserId}
        onDeleted={() => {
          window.dispatchEvent(new CustomEvent('admin:user-deleted', { detail: { userId: selectedUserId } }));
          setSelectedUserId(null);
          setDeleteUserOpen(false);
        }}
      />
      <DeleteApplicationModal
        open={deleteApplicationOpen}
        onClose={() => setDeleteApplicationOpen(false)}
        applicationId={selectedApplicationId}
        onDeleted={() => {
          window.dispatchEvent(new CustomEvent('admin:application-deleted', { detail: { applicationId: selectedApplicationId } }));
          setSelectedApplicationId(null);
          setDeleteApplicationOpen(false);
        }}
      />
    </div>
  );
}

// Wrappers to reuse existing styled components with adminService data
function EmployersWrapper(props: any) {
  const [data, setData] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    adminService.getAllEmployers().then((res: any) => { if (mounted) setData(res || []); }).catch(() => {});
    return () => { mounted = false; };
  }, []);
  return <EmployersListView employers={data} />;
}

function UsersWrapper(props: any) {
  const [data, setData] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    adminService.getAllUsers().then((res: any) => { if (mounted) setData(res || []); }).catch(() => {});
    return () => { mounted = false; };
  }, []);
  React.useEffect(() => {
    const h = (e: any) => {
      const userId = e.detail?.userId;
      if (!userId) return;
      setData((prev) => prev.filter((u) => u?.id !== userId));
    };
    window.addEventListener('admin:user-deleted', h);
    return () => window.removeEventListener('admin:user-deleted', h);
  }, []);
  return <UsersListView users={data} />;
}

function StudentsWrapper(props: any) {
  const [data, setData] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    adminService.getAllStudents().then((res: any) => {
      if (!mounted) return;
      const list = (res || []).map((it: any) => {
        const createdAt = it.created_at ?? it.registered_at ?? it.createdAt ?? it.registeredAt ?? (it.user && (it.user.created_at ?? it.user.createdAt)) ?? null;
        return { ...it, created_at: createdAt };
      });
      setData(list);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);
  return <StudentsListView students={data} />;
}

function ReportsWrapper(props: any) {
  // ReportsListView manages its own loading; just render it
  return <ReportsListView />;
}

function InternshipsWrapper(props: any) {
  const [data, setData] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [deleteInternshipOpen, setDeleteInternshipOpen] = React.useState(false);
  const [selectedInternshipId, setSelectedInternshipId] = React.useState<number | null>(null);
  React.useEffect(() => {
    let mounted = true;
    // load internships and enrich each with applications_count so the table shows counts
    (async () => {
      try {
        const res: any[] = await adminService.getAllInternships();
        if (!mounted) return;
        // use admin report endpoint to get aggregated counts (admin access)
        try {
          const report = await adminService.getApplicationsByInternshipReport();
          const countsById: Record<string | number, number> = {};
          (report || []).forEach((r: any) => {
            if (r && (r.internship_id !== undefined)) countsById[r.internship_id] = r.applications_count ?? 0;
          });
          const enriched = (res || []).map((it) => ({ ...it, applications_count: countsById[it.id] ?? 0 }));
          if (mounted) setData(enriched);
          return;
        } catch (err) {
          // fallback: if report endpoint fails, leave counts as 0 and set raw data
          // eslint-disable-next-line no-console
          console.debug('Failed to load applications-by-internship report, falling back to 0 counts', err);
          if (mounted) setData((res || []).map((it) => ({ ...it, applications_count: 0 })));
          return;
        }
        if (mounted) setData(enriched);
      } catch (err) {
        if (mounted) setData([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = React.useMemo(() => {
    if (!searchTerm) return data;
    const s = searchTerm.toLowerCase();
    return data.filter((i: any) => (String(i.title || '')).toLowerCase().includes(s) || (String(i.company_name || '')).toLowerCase().includes(s));
  }, [data, searchTerm]);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Стажировки ({filtered.length})</h3>
      <div className={styles.searchRow} style={{ marginBottom: 12 }}>
        <input
          className={styles.searchInput}
          placeholder="Поиск по названию, компании..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className={styles.responsive}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>ID</th>
              <th className={styles.tableHeaderCell}>Название</th>
              <th className={styles.tableHeaderCell}>Компания</th>
              <th className={styles.tableHeaderCell}>Заявок</th>
              <th className={styles.tableHeaderCell}>Статус</th>
              <th className={styles.tableHeaderCell}>Дедлайн</th>
              <th className={styles.tableHeaderCell} style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{it.id}</td>
                <td className={styles.tableCell}>{it.title}</td>
                <td className={styles.tableCell}>{it.company_name ?? ''}</td>
                <td className={styles.tableCell}>{it.applications_count ?? ''}</td>
                <td className={styles.tableCell}>{it.status ?? ''}</td>
                <td className={styles.tableCell}>{formatDate(it.deadline)}</td>
                <td className={styles.tableCell}>
                  <button
                    className={styles.iconButton}
                    onClick={() => {
                      setSelectedInternshipId(it.id);
                      setDeleteInternshipOpen(true);
                    }}
                    title="Удалить"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <img src="/Delete--Streamline-Sharp-Material-Symbols.svg" alt="Удалить" style={{ width: 18, height: 18 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DeleteInternshipModal
        open={deleteInternshipOpen}
        onClose={() => setDeleteInternshipOpen(false)}
        internshipId={selectedInternshipId}
        onDeleted={() => {
          if (selectedInternshipId != null) setData((prev) => prev.filter((p) => p.id !== selectedInternshipId));
          setSelectedInternshipId(null);
          setDeleteInternshipOpen(false);
        }}
      />
    </div>
  );
}

function ApplicationsWrapper(props: any) {
  const [data, setData] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  React.useEffect(() => {
    let mounted = true;
    adminService.getAllApplications().then((res: any) => { if (mounted) setData(res || []); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    const h = (e: any) => {
      const applicationId = e.detail?.applicationId;
      if (!applicationId) return;
      setData((prev) => prev.filter((a) => (a.id ?? a.application_id) !== applicationId));
    };
    window.addEventListener('admin:application-deleted', h);
    return () => window.removeEventListener('admin:application-deleted', h);
  }, []);

  const filtered = React.useMemo(() => {
    if (!searchTerm) return data;
    const s = searchTerm.toLowerCase();
    return data.filter((it) => {
      const student = (it.student_name ?? it.student_full_name ?? it.student_fullname ?? '').toString().toLowerCase();
      const internship = (it.internship_title ?? it.internship_id ?? '').toString().toLowerCase();
      return student.includes(s) || internship.includes(s) || String(it.application_id ?? it.id ?? '').includes(s);
    });
  }, [data, searchTerm]);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Отклики ({filtered.length})</h3>
      <div className={styles.searchRow} style={{ marginBottom: 12 }}>
        <input
          className={styles.searchInput}
          placeholder="Поиск по студенту, стажировке..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className={styles.responsive}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>ID</th>
              <th className={styles.tableHeaderCell}>Студент</th>
              <th className={styles.tableHeaderCell}>Стажировка</th>
              <th className={styles.tableHeaderCell}>Дата</th>
              <th className={styles.tableHeaderCell} style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((it, idx) => {
              const id = it.id ?? it.application_id ?? null;
              const studentName = it.student_name ?? it.student_full_name ?? it.student_fullname ?? '';
              const internshipRef = it.internship_title ?? it.internship_id ?? '';
              const createdAt = it.created_at ?? it.applied_at ?? it.appliedAt ?? null;
              const key = id ?? `app-${idx}-${internshipRef}`;
              return (
                <tr key={key} className={styles.tableRow}>
                  <td className={styles.tableCell}>{id ?? ''}</td>
                  <td className={styles.tableCell}>{studentName}</td>
                  <td className={styles.tableCell}>{internshipRef}</td>
                  <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>{formatDate(createdAt)}</td>
                  <td className={styles.tableCell}>
                    <button
                      className={styles.iconButton}
                      onClick={() => window.dispatchEvent(new CustomEvent('admin:open-delete-application', { detail: { applicationId: id } }))}
                      title="Удалить"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      <img src="/Delete--Streamline-Sharp-Material-Symbols.svg" alt="Удалить" style={{ width: 18, height: 18 }} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArticlesWrapper(props: any) {
  return <AdminArticlesList />;
}
