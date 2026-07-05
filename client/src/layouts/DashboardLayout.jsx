import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpenCheck, Clock, GraduationCap, LayoutDashboard, LogOut, QrCode, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const navItems = {
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', to: '/admin/analytics', icon: Sparkles },
    { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
    { label: 'Students', to: '/admin/students', icon: GraduationCap },
    { label: 'Faculty', to: '/admin/faculty', icon: Users },
    { label: 'Attendance', to: '/admin/attendance', icon: BookOpenCheck },
    { label: 'Attendance History', to: '/admin/attendance/history', icon: Clock },
    { label: 'QR Sessions', to: '/admin/qr-sessions', icon: QrCode }
  ],
  faculty: [
    { label: 'Overview', to: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'QR Attendance', to: '/faculty/qr', icon: QrCode },
    { label: 'Attendance History', to: '/faculty/attendance/history', icon: Clock }
  ],
  student: [
    { label: 'Overview', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'QR Attendance', to: '/student/qr', icon: QrCode },
    { label: 'Attendance History', to: '/student/attendance/history', icon: Clock }
  ]
};

function DashboardLayout({ role, title }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const items = navItems[role] || navItems.student;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200/70 bg-slate-950/95 px-5 py-6 text-slate-100 shadow-2xl md:block">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
          <div className="rounded-xl bg-teal-400/20 p-2 text-teal-300">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Attendance OS</p>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-teal-500/20 text-white shadow-lg shadow-teal-500/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`
                }
                key={item.label}
                to={item.to}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Need a quick update?</p>
          <p className="mt-1 text-slate-400">Monitor attendance trends and act faster.</p>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{user.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 sm:block">
                {user.role === 'admin' ? 'Administrator' : user.role === 'faculty' ? 'Faculty Access' : 'Student Access'}
              </div>
              <button
                className="flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={handleLogout}
                type="button"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
