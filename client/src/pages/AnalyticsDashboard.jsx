import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, CircleCheckBig, Users, UserRoundPlus } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import api from '../services/api.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/analytics').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm">Loading dashboard...</div>;

  const pieData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{ data: [stats.present.count, stats.absent.count, stats.late.count], backgroundColor: ['#10B981', '#EF4444', '#F59E0B'] }]
  };

  const barData = {
    labels: stats.departmentWise.map((d) => d.department),
    datasets: [{ label: 'Total', data: stats.departmentWise.map((d) => d.total), backgroundColor: '#3B82F6' }]
  };

  const lineData = {
    labels: stats.monthly.map((m) => m.month),
    datasets: [{ label: 'Attendance', data: stats.monthly.map((m) => m.total), borderColor: '#6366F1', fill: false }]
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Analytics</p>
          <h2 className="text-2xl font-semibold text-slate-900">Performance Overview</h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
          Updated live from attendance data
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, accent: 'from-cyan-500 to-teal-500' },
          { label: 'Total Faculty', value: stats.totalFaculty, icon: UserRoundPlus, accent: 'from-violet-500 to-fuchsia-500' },
          { label: 'Total Attendance', value: stats.totalAttendance, icon: CalendarDays, accent: 'from-amber-500 to-orange-500' },
          { label: 'Present %', value: `${stats.present.pct}%`, icon: CircleCheckBig, accent: 'from-emerald-500 to-green-500' }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${card.accent} p-2 text-white`}>
                <Icon size={16} />
              </div>
              <div className="mt-4 text-sm text-slate-500">{card.label}</div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-2xl font-semibold text-slate-900">{card.value}</div>
                <div className="rounded-full bg-slate-100 p-1 text-slate-500"><ArrowUpRight size={14} /></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Status Distribution</h3>
          <Pie data={pieData} />
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Department-wise Attendance</h3>
          <Bar data={barData} />
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Monthly Attendance</h3>
        <Line data={lineData} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Recent Attendance</h3>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {stats.recentAttendance.map((r) => (
                  <tr key={r.id} className="border-t bg-white/60">
                    <td className="px-3 py-3 text-slate-500">{r.attendanceDate}</td>
                    <td className="px-3 py-3 font-medium text-slate-700">{r.studentName}</td>
                    <td className="px-3 py-3 text-slate-500">{r.facultyName}</td>
                    <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Recent Students</h3>
          <div className="space-y-2">
            {stats.recentStudents.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-700">
                <div className="font-medium text-slate-900">{s.fullName}</div>
                <div className="mt-1 text-slate-500">{s.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
