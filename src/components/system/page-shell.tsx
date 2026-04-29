import type { ComponentType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("app-page", className)} {...props} />;
}

export function PageHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cn("app-page-header", className)} {...props} />;
}

export function PageHeaderHeading({
  title,
  meta,
  className,
  children,
}: {
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("app-page-heading", className)}>
      <div className="min-w-0">
        <h1 className="app-page-title">{title}</h1>
        {meta ? <p className="app-page-meta">{meta}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function PageHeaderActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("app-page-actions", className)} {...props} />;
}

export function PageToolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("app-page-toolbar", className)} {...props} />;
}

export function PageToolbarGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("app-page-toolbar-group", className)} {...props} />;
}

export function PageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("app-page-content", className)} {...props} />;
}

export function PageStack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("app-page-stack", className)} {...props} />;
}

export function PageSection({
  title,
  description,
  actions,
  className,
  headerClassName,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const hasHeader = title || description || actions;

  return (
    <section className={cn("app-surface", className)}>
      {hasHeader ? (
        <div className={cn("app-section-header", headerClassName)}>
          <div className="min-w-0">
            {title ? <h2 className="app-section-title">{title}</h2> : null}
            {description ? <p className="app-section-description">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn("app-section-body", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("app-empty-state", className)}>
      {Icon ? (
        <div className="app-empty-icon">
          <Icon className="h-7 w-7" />
        </div>
      ) : null}
      <div className="space-y-1">
        <h2 className="app-empty-title">{title}</h2>
        {description ? <p className="app-empty-copy">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
