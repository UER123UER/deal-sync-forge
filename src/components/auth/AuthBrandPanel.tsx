import type { LucideIcon } from 'lucide-react';

import { UERLogo } from '@/components/UERLogo';

type BrandItem = {
  icon: LucideIcon;
  text: string;
};

type AuthBrandPanelProps = {
  title: string;
  description: string;
  items: BrandItem[];
};

export function AuthBrandPanel({ title, description, items }: AuthBrandPanelProps) {
  return (
    <div className="relative hidden overflow-hidden border-r bg-white p-12 lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-24 h-64 w-64 rounded-full border-[36px] border-[hsl(var(--sidebar-bg)/0.08)]" />
        <div className="absolute bottom-32 right-0 h-96 w-96 rounded-full border-[52px] border-[hsl(var(--sidebar-bg)/0.07)]" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[72px] border-[hsl(var(--sidebar-bg)/0.05)]" />
      </div>

      <div className="relative z-10">
        <UERLogo width={220} />
      </div>

      <div className="relative z-10 space-y-8">
        <div>
          <h1 className="max-w-lg whitespace-pre-line text-3xl font-bold leading-tight text-[hsl(var(--sidebar-bg))]">
            {title}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sidebar-bg)/0.08)] text-[hsl(var(--sidebar-bg))]">
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-xs text-slate-400">© {new Date().getFullYear()} United Estates Realty</p>
    </div>
  );
}
