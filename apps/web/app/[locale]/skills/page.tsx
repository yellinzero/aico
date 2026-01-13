import { getTranslations } from 'next-intl/server';

import { SkillsContainer } from '@/components/skills/skills-container';
import { getSkillsByCategory } from '@/lib/registry';

interface SkillsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const { category } = await searchParams;
  const t = await getTranslations('SkillsPage');

  // 在服务端获取数据
  const rawSkills = getSkillsByCategory(category);

  // 应用翻译
  const skills = rawSkills.map((skill) => {
    const translationKey = `skills.${skill.category}.${skill.name}.description`;
    return {
      ...skill,
      description: t.has(translationKey)
        ? t(translationKey)
        : skill.description,
    };
  });

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
      </div>

      <SkillsContainer skills={skills} noResultsText={t('noResults')} />
    </div>
  );
}
