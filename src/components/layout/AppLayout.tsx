import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  return (
    <div className="app-shell flex min-h-screen w-full flex-col lg:flex-row">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-16 lg:min-h-screen lg:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
