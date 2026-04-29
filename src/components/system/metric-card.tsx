import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type MetricTone = 'default' | 'primary' | 'success' | 'warning';

const toneClasses: Record<MetricTone, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
};

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  description?: string;
  tone?: MetricTone;
  className?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  tone = 'default',
  className,
}: MetricCardProps) {
  return (
    <section className={cn('app-surface p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                toneClasses[tone],
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
              {value}
            </div>
            {description ? (
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
