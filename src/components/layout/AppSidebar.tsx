import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Users, DollarSign, Mail, CheckSquare, Calendar, Gift, Phone, Shield, Building2 } from 'lucide-react';
import { UERLogo } from '@/components/UERLogo';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { icon: Plus, label: 'Create', path: '/transactions/new' },
  { icon: Users, label: 'People', path: '/people', hasSubmenu: true },
  { icon: Building2, label: 'Transactions', path: '/transactions' },
  { icon: Home, label: 'Listings', path: '/listings' },
  { icon: DollarSign, label: 'Finances', path: '/finances' },
  { icon: Gift, label: 'Referral', path: '/referral' },
  { icon: Phone, label: 'Brokerage', path: '/contact-brokerage' },
  { icon: Shield, label: 'Admin', path: '/admin/pdf-editor' },
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

  return (
    <div className="w-16 min-h-screen flex flex-col items-center py-4 gap-1 relative" style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}>
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
                  'w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors',
                  isActive ? 'bg-opacity-20' : 'hover:bg-opacity-10'
                )}
                style={{
                  backgroundColor: isActive || submenuOpen ? 'hsl(var(--sidebar-hover))' : undefined,
                }}
                title={item.label}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" style={{ color: isActive ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-fg))' }} />
                  {overdueCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                      {overdueCount > 99 ? '99+' : overdueCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] leading-none" style={{ color: isActive ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-fg))' }}>
                  {item.label}
                </span>
              </button>

              {submenuOpen && (
                <div
                  ref={submenuRef}
                  className="absolute left-full top-0 ml-2 bg-popover border rounded-md shadow-lg py-1 w-40 z-50"
                >
                  {peopleSubmenu.map((sub) => {
                    const subActive = location.pathname.startsWith(sub.path);
                    return (
                      <button
                        key={sub.path}
                        onClick={() => { navigate(sub.path); setSubmenuOpen(false); }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
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
              'w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors',
              isActive ? 'bg-opacity-20' : 'hover:bg-opacity-10'
            )}
            style={{
              backgroundColor: isActive ? 'hsl(var(--sidebar-hover))' : undefined,
            }}
            title={item.label}
          >
            <item.icon className="w-5 h-5" style={{ color: isActive ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-fg))' }} />
            <span className="text-[9px] leading-none" style={{ color: isActive ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-fg))' }}>
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
          'mt-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ring-2 shrink-0',
          profileActive
            ? 'ring-[hsl(var(--sidebar-active))] scale-105'
            : 'ring-transparent hover:ring-[hsl(var(--sidebar-fg))/40] hover:scale-105'
        )}
        style={{
          background: profileActive
            ? 'hsl(var(--sidebar-active))'
            : 'hsl(var(--sidebar-hover))',
        }}
      >
        <span
          className="text-[13px] font-bold leading-none select-none"
          style={{ color: profileActive ? 'hsl(var(--sidebar-bg))' : 'hsl(var(--sidebar-fg))' }}
        >
          {initials}
        </span>
      </button>
    </div>
  );
}
