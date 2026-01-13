'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = ['all', 'pm', 'frontend', 'backend', 'shared'];

interface SkillsFilterProps {
  onSearch?: (query: string) => void;
}

export function SkillsFilter({ onSearch }: SkillsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('SkillsPage');
  const currentCategory = searchParams.get('category') || 'all';

  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleCategoryChange = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams);
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      router.push(`/skills?${params.toString()}`);
    },
    [searchParams, router]
  );

  return (
    <div className="mb-6 space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchValue}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={currentCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(cat)}
          >
            {t(`filter.${cat}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}
