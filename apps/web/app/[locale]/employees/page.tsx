import { getTranslations } from 'next-intl/server';

import { EmployeesGrid } from '@/components/employees/employees-grid';
import { getEmployees } from '@/lib/registry';

export default async function EmployeesPage() {
  const t = await getTranslations('EmployeesPage');

  // 在服务端获取数据并应用翻译
  const rawEmployees = getEmployees();
  const employees = rawEmployees.map((emp) => ({
    ...emp,
    // 使用 i18n 翻译，如果没有则使用原始值
    role: t.has(`${emp.name}.role`) ? t(`${emp.name}.role`) : emp.role,
    description: t.has(`${emp.name}.description`)
      ? t(`${emp.name}.description`)
      : emp.description,
  }));

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
      </div>

      <EmployeesGrid employees={employees} noResultsText={t('noResults')} />
    </div>
  );
}
