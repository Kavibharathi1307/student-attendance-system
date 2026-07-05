import { useEffect, useState } from 'react';
import { BarChart3, BookOpenCheck, CalendarDays, GraduationCap, QrCode, TrendingUp, Users, UserRoundPlus } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setData(r.data)).catch((err) => {
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-[24px] border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 shadow-sm">{error}</div>;
  }

  if (!data) {
    return <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm">Could not load dashboard data.</div>;
  }

  const cardTheme = (i) => {
    const themes = [
      { icon: GraduationCap, bg: 'from-cyan-500 to-teal-500' },
      { icon: Users, bg: 'from-violet-500 to-fuchsia-500' },
      { icon: CalendarDays, bg: 'from-amber-500 to-orange-500' },
      { icon: TrendingUp, bg: 'from-emerald-500 to-green-500' }
    ];
    return themes[i] || themes[0];
  };

  const topCards = [
    { label: 'Total Students', value: data.totalStudents },
    { label: 'Total Faculty', value: data.totalFaculty },
    { label: "Today's Attendance", value: data.todayAttendance },
    { label: 'Overall Attendance', value: `${data.overallAttendancePct}%` }
  ];

  const quickStats = [
    { label: 'Present Today', value: data.presentToday, accent: 'bg-emerald-100 text-emerald-700' },
    { label: 'Absent Today', value: data.absentToday, accent: 'bg-red-100 text-red-700' },
    { label: 'Active QR Sessions', value: data.activeQrSessions, accent: 'bg-indigo-100 text-indigo-700' },
    { label: 'Total Records', value: data.totalAttendance, accent: 'bg-slate-100 text-slate-700' }
  ];

  const lineData = {
    labels: data.weeklyTrend.map((d) => {
      const parts = d.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    }),
    datasets: [
      {
        label: 'Present',
        data: data.weeklyTrend.map((d) => d.present),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Absent',
        data: data.weeklyTrend.map((d) => d.absent),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Late',
        data: data.weeklyTrend.map((d) => d.late),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245,158,11,0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-900 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Admin overview</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Admin Dashboard</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {data.totalStudents} students • {data.totalFaculty} faculty • {data.todayAttendance} attendance records captured today.
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card, i) => {
          const { icon: Icon, bg } = cardTheme(i);
          return (
            <div key={card.label} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${bg} p-2.5 text-white`}>
                <Icon size={18} />
              </div>
              <p className="mt-4 text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-700">Attendance trend</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Last 7 Days</h3>
            </div>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
              <BarChart3 size={16} className="inline" /> Trend
            </div>
          </div>
          {data.weeklyTrend.length === 0 ? (
            <p className="mt-5 text-sm text-slate-400">No attendance data for the last 7 days.</p>
          ) : (
            <div className="mt-5">
              <Line data={lineData} options={lineOptions} />
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            <BookOpenCheck size={16} className="text-indigo-500" />
            Quick overview
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <GraduationCap size={16} className="text-teal-600" />
                {data.totalStudents} Students enrolled
              </div>
              <p className="mt-2 text-sm text-slate-500">Across the institution.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <UserRoundPlus size={16} className="text-indigo-600" />
                {data.totalFaculty} Faculty members
              </div>
              <p className="mt-2 text-sm text-slate-500">Managing classes and attendance.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <QrCode size={16} className="text-indigo-600" />
                {data.activeQrSessions > 0 ? `${data.activeQrSessions} active QR session(s)` : 'No active QR sessions'}
              </div>
              <p className="mt-2 text-sm text-slate-500">{data.activeQrSessions > 0 ? 'Students can scan to mark attendance.' : 'Generate QR codes from the QR Sessions page.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-700">Recent activity</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Latest attendance records</h3>
          </div>
          <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">Last 10</div>
        </div>

        {data.recentAttendance.length === 0 ? (
          <p className="mt-5 text-sm text-slate-400">No attendance records yet.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {data.recentAttendance.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{rec.studentName}</p>
                  <p className="text-sm text-slate-500">{rec.subject} • {rec.attendanceDate} • {rec.facultyName}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rec.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : rec.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
