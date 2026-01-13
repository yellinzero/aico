'use client';

import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeCopyButton } from '@/components/code-copy-button';

interface EmployeeCardProps {
  name: string;
  fullName: string;
  role: string;
  description: string;
  skillCount: number;
  commandCount: number;
}

export function EmployeeCard({
  name,
  fullName,
  role,
  description,
  skillCount,
  commandCount,
}: EmployeeCardProps) {
  const t = useTranslations('EmployeesPage');
  const command = `aico add ${fullName}`;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link href={`/docs/${name}`} className="hover:underline">
            <h3 className="font-semibold">{role}</h3>
          </Link>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{fullName}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <div className="mt-3 flex gap-2">
          <Badge variant="secondary">
            {skillCount} {t('skills')}
          </Badge>
          <Badge variant="outline">
            {commandCount} {t('commands')}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full items-center gap-2 rounded bg-muted px-2 py-1 font-mono text-xs">
          <span className="flex-1 truncate">{command}</span>
          <CodeCopyButton code={command} />
        </div>
      </CardFooter>
    </Card>
  );
}
