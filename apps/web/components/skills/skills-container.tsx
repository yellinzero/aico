'use client';

import { useState, useMemo } from 'react';

import { SkillsFilter } from './skills-filter';
import { SkillCard } from './skill-card';
import { Skill } from '@/lib/registry';

interface SkillsContainerProps {
  skills: Skill[];
  noResultsText: string;
}

export function SkillsContainer({
  skills,
  noResultsText,
}: SkillsContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = useMemo(() => {
    if (!searchQuery) {
      return skills;
    }
    const query = searchQuery.toLowerCase();
    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) ||
        skill.fullName.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query)
    );
  }, [skills, searchQuery]);

  return (
    <>
      <SkillsFilter onSearch={setSearchQuery} />

      {filteredSkills.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {noResultsText}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.fullName}
              name={skill.name}
              fullName={skill.fullName}
              description={skill.description}
              category={skill.category}
              usedBy={skill.usedBy}
            />
          ))}
        </div>
      )}
    </>
  );
}
