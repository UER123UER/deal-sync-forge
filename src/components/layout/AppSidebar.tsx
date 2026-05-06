import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Users, DollarSign, Mail, CheckSquare, Calendar, Gift, Phone, Link2, Menu, MoreHorizontal } from 'lucide-react';
import { UERLogo } from '@/components/UERLogo';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  { icon: Plus, label: 'Create', path: '/transactions/new' },
  { icon: Users, label: 'People', path: '/people', hasSubmenu: true },
  { icon: Home, label: 'Deals', path: '/transactions' },
  { icon: DollarSign, label: 'Finances', path: '/finances' },
  { icon: Gift, label: 'Referral', path: '/referral' },
  { icon: Phone, label: 'Brokerage', path: '/contact-brokerage' },
  { icon: Link2, label: 'Affiliate', path: '/affiliate-links' },
];

const peopleSubmenu = [
  { icon: Users, label: 'People', path: '/people' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Mail, label: 'Inbox', path: '/inbox' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { profile, user } = useAuth();

  // Avatar initials from profile or email
  const initials = (() => {
    const first = profile?.first_name?.trim();
    const last = profile?.last_name?.trim();
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.slice(0, 2).toUpperCase();
    const email = user?.email ?? '';
    return email.slice(0, 2).toUpperCase();
  })();

  const profileActive = location.pathname.startsWith('/profile');

  // Overdue follow-up count for the People badge
  const { data: contacts = [] } = useContacts();
  const overdueCount = contacts.filter((c) => {
    if (!c.next_touch) return false;
    try { return new Date(c.next_touch) < new Date(); } catch { return false; }
  }).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        submenuRef.current && !submenuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setSubmenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPathActive = (path: string) => (
    path === '/transactions/new'
      ? location.pathname === '/transactions/new'
      : location.pathname.startsWith(path)
  );

  const navButtonBase = 'group flex min-h-[4.5rem] w-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 text-[11px] font-medium leading-tight transition-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sidebar-ring))] focus-visible:ring-offset-0';
  const navButtonActive = 'border-white/10 bg-white/[0.08] text-[hsl(var(--sidebar-primary-foreground))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]';
  const navButtonIdle = 'border-transparent text-[hsl(var(--sidebar-foreground))] hover:border-white/5 hover:bg-white/[0.05] hover:text-white';
  const mobileNavItems = [
    { icon: Home, label: 'Deals', path: '/transactions' },
    { icon: Users, label: 'People', path: '/people', badge: overdueCount },
    { icon: Plus, label: 'Create', path: '/transactions/new' },
    { icon: DollarSign, label: 'Finances', path: '/finances' },
  ];
  const mobileListItemBase = 'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-standard';
  const mobileListItemActive = 'bg-primary/10 text-primary';
  const mobileListItemIdle = 'text-foreground hover:bg-muted';
  const handleMobileNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background text-foreground transition-standard hover:bg-muted"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button type="button" onClick={() => navigate('/transactions')} className="flex items-center justify-center">
          <UERLogo width={132} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/profile')}
          aria-label="Open profile"
          className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-bold text-foreground transition-standard hover:bg-accent"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </button>
      </div>

      <aside className="relative hidden min-h-screen w-24 shrink-0 flex-col items-center gap-2 border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] px-2 py-4 lg:flex">
        <div className="mb-4 flex w-full items-center justify-center">
          <UERLogo width={56} />
        </div>

        <div className="flex w-full flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = isPathActive(item.path);

            if (item.hasSubmenu) {
              return (
                <div key={item.path} className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setSubmenuOpen(!submenuOpen)}
                    className={cn(
                      navButtonBase,
                      isActive || submenuOpen
                        ? navButtonActive
                        : navButtonIdle
                    )}
                    title={item.label}
                  >
                    <div className="relative">
                      <item.icon
                        className={cn(
                          'h-5 w-5',
                          isActive || submenuOpen
                            ? 'text-[hsl(var(--sidebar-primary-foreground))]'
                            : 'text-[hsl(var(--sidebar-foreground))] group-hover:text-white'
                        )}
                      />
                      {overdueCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
                          {overdueCount > 99 ? '99+' : overdueCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'max-w-full text-center break-words',
                        isActive || submenuOpen
                          ? 'text-[hsl(var(--sidebar-primary-foreground))]'
                          : 'text-[hsl(var(--sidebar-foreground))] group-hover:text-white'
                      )}
                    >
                      {item.label}
                    </span>
                  </button>

                  {submenuOpen && (
                    <div
                      ref={submenuRef}
                      className="absolute left-full top-0 z-50 ml-3 w-44 rounded-lg border bg-popover py-1 shadow-floating"
                    >
                      {peopleSubmenu.map((sub) => {
                        const subActive = location.pathname.startsWith(sub.path);
                        return (
                          <button
                            key={sub.path}
                            onClick={() => { navigate(sub.path); setSubmenuOpen(false); }}
                            className={cn(
                              'flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium transition-standard',
                              subActive ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent'
                            )}
                          >
                            <sub.icon className="h-4 w-4" />
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  navButtonBase,
                  isActive
                    ? navButtonActive
                    : navButtonIdle
                )}
                title={item.label}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    isActive
                      ? 'text-[hsl(var(--sidebar-primary-foreground))]'
                      : 'text-[hsl(var(--sidebar-foreground))] group-hover:text-white'
                  )}
                />
                <span
                  className={cn(
                    'max-w-full text-center break-words',
                    isActive
                      ? 'text-[hsl(var(--sidebar-primary-foreground))]'
                      : 'text-[hsl(var(--sidebar-foreground))] group-hover:text-white'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/profile')}
          title="My Profile"
          className={cn(
            'mt-2 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 transition-standard',
            profileActive
              ? 'ring-[hsl(var(--sidebar-active))] scale-105'
              : 'ring-transparent hover:ring-white/30 hover:scale-105'
          )}
          style={{
            background: profile?.avatar_url ? undefined : profileActive
              ? 'hsl(var(--sidebar-active))'
              : 'hsl(var(--sidebar-hover))',
          }}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="select-none text-[13px] font-bold leading-none"
              style={{ color: profileActive ? 'hsl(var(--sidebar-bg))' : 'hsl(var(--sidebar-fg))' }}
            >
              {initials}
            </span>
          )}
        </button>
      </aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[22rem] max-w-[88vw] p-0">
          <SheetHeader className="border-b px-5 py-4 text-left">
            <div className="mb-3">
              <UERLogo width={154} />
            </div>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Move between brokerage workspaces and account settings.</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 overflow-y-auto px-4 py-4">
            <div className="space-y-1.5">
              <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Core</div>
              {navItems.filter((item) => !item.hasSubmenu).map((item) => {
                const isActive = isPathActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleMobileNavigate(item.path)}
                    className={cn(mobileListItemBase, isActive ? mobileListItemActive : mobileListItemIdle)}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">People Workspace</div>
              {peopleSubmenu.map((item) => {
                const isActive = isPathActive(item.path);
                const showBadge = item.path === '/people' && overdueCount > 0;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleMobileNavigate(item.path)}
                    className={cn(mobileListItemBase, isActive ? mobileListItemActive : mobileListItemIdle)}
                  >
                    <div className="relative shrink-0">
                      <item.icon className="h-4 w-4" />
                      {showBadge ? (
                        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                          {overdueCount > 99 ? '99+' : overdueCount}
                        </span>
                      ) : null}
                    </div>
                    <span className="min-w-0 flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Account</div>
              <button
                type="button"
                onClick={() => handleMobileNavigate('/profile')}
                className={cn(mobileListItemBase, profileActive ? mobileListItemActive : mobileListItemIdle)}
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold text-foreground">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <span className="min-w-0 flex-1 text-left">My Profile</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:hidden">
        <div className="grid grid-cols-5">
          {mobileNavItems.map((item) => {
            const isActive = isPathActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-standard',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge ? (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-muted-foreground transition-standard hover:text-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
