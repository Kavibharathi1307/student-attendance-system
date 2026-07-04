import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Outlet />
    </main>
  );
}

export default MainLayout;
