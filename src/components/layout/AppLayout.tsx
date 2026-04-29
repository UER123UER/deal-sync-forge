import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  return (
    <div className="app-shell flex w-full">
      <AppSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
