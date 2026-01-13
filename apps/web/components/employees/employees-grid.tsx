import { EmployeeCard } from '@/components/employees/employee-card';
import { Employee } from '@/lib/registry';

interface EmployeesGridProps {
  employees: Employee[];
  noResultsText: string;
}

export function EmployeesGrid({
  employees,
  noResultsText,
}: EmployeesGridProps) {
  if (employees.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {noResultsText}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {employees.map((emp) => (
        <EmployeeCard
          key={emp.fullName}
          name={emp.name}
          fullName={emp.fullName}
          role={emp.role}
          description={emp.description}
          skillCount={emp.skills.length}
          commandCount={emp.commands.length}
        />
      ))}
    </div>
  );
}
