import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeCopyButton } from '@/components/code-copy-button';

interface SkillCardProps {
  name: string;
  fullName: string;
  description: string;
  category: string;
  usedBy?: string[];
}

export function SkillCard({
  name,
  fullName,
  description,
  category,
  usedBy,
}: SkillCardProps) {
  const command = `aico add ${fullName}`;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{name}</h3>
          <Badge variant="secondary">{category}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{fullName}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        {usedBy && usedBy.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-muted-foreground">Used by:</span>
            {usedBy.map((emp) => (
              <Badge key={emp} variant="outline" className="text-xs">
                {emp}
              </Badge>
            ))}
          </div>
        )}
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
