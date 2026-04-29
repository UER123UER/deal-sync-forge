import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Users, DollarSign, Mail, CheckSquare, Calendar, Gift, Phone, Shield, Link2 } from 'lucide-react';
import { UERLogo } from '@/components/UERLogo';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { icon: Plus, label: 'Create', path: '/transactions/new' },
  { icon: Users, label: 'People', path: '/people', hasSubmenu: true },
  { icon: Home, label: 'Transactions', path: '/transactions' },
  { icon: DollarSign, label: 'Finances', path: '/finances' },
  { icon: Gift, label: 'Referral', path: '/referral' },
  { icon: Phone, label: 'Brokerage', path: '/contact-brokerage' },
  { icon: Shield, label: 'Admin', path: '/admin/pdf-editor' },
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

  const navButtonBase = 'group flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-lg border border-transparent text-[10px] font-medium leading-none transition-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sidebar-ring))] focus-visible:ring-offset-0';

  return (
    <aside className="relative flex min-h-screen w-16 shrink-0 flex-col items-center gap-1 border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] py-4">
      {/* Logo */}
      <div className="w-14 mb-4 flex items-center justify-center">
        <UERLogo width={48} />
      </div>

      {/* Nav items — flex-1 so profile stays at bottom */}
      <div className="flex flex-col items-center gap-1 flex-1 w-full">
      {navItems.map((item) => {
        const isActive = item.path === '/transactions/new'
          ? location.pathname === '/transactions/new'
          : location.pathname.startsWith(item.path);

        if (item.hasSubmenu) {
          return (
            <div key={item.path} className="relative">
              <button
                ref={buttonRef}
                onClick={() => setSubmenuOpen(!submenuOpen)}
                className={cn(
                  navButtonBase,
                  isActive || submenuOpen
                    ? 'bg-[hsl(var(--sidebar-accent))]'
                    : 'hover:border-white/5 hover:bg-white/[0.05]'
                )}
                title={item.label}
              >
                <div className="relative">
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground))]')} />
                  {overdueCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                      {overdueCount > 99 ? '99+' : overdueCount}
                    </span>
                  )}
                </div>
                <span className={cn('leading-none', isActive ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground))]')}>
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
                        <sub.icon className="w-4 h-4" />
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
                ? 'bg-[hsl(var(--sidebar-accent))]'
                : 'hover:border-white/5 hover:bg-white/[0.05]'
            )}
            title={item.label}
          >
            <item.icon className={cn('h-5 w-5', isActive ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground))]')} />
            <span className={cn('leading-none', isActive ? 'text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-foreground))]')}>
              {item.label}
            </span>
          </button>
        );
      })}
      </div>

      {/* Profile avatar — pinned to bottom */}
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
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="text-[13px] font-bold leading-none select-none"
            style={{ color: profileActive ? 'hsl(var(--sidebar-bg))' : 'hsl(var(--sidebar-fg))' }}
          >
            {initials}
          </span>
        )}
      </button>
    </aside>
  );
}
