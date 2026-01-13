import { SkillCard } from '@/components/skills/skill-card';
import { Skill } from '@/lib/registry';

interface SkillsGridProps {
  skills: Skill[];
  noResultsText: string;
}

export function SkillsGrid({ skills, noResultsText }: SkillsGridProps) {
  if (skills.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {noResultsText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
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
  );
}
