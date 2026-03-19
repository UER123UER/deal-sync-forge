import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, Home, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Building2, label: 'Transactions', path: '/transactions' },
  { icon: Home, label: 'Listings', path: '/listings' },
  { icon: CalendarDays, label: 'Open House', path: '/open-house' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="w-16 min-h-screen flex flex-col items-center py-4 gap-1" style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}>
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'hsl(var(--sidebar-active))' }}>
        <Building2 className="w-5 h-5" style={{ color: 'hsl(var(--sidebar-active-fg))' }} />
      </div>

      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors group relative',
              isActive ? 'bg-opacity-20' : 'hover:bg-opacity-10'
            )}
            style={{
              backgroundColor: isActive ? 'hsl(var(--sidebar-hover))' : undefined,
            }}
            title={item.label}
          >
            <item.icon
              className="w-5 h-5"
              style={{ color: isActive ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-fg))' }}
            />
            <span
              className="text-[9px] leading-none"
              style={{ color: isActive ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-fg))' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
