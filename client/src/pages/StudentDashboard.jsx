import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, GraduationCap, QrCode, Sparkles, TrendingUp, UserRound } from 'lucide-react';
import api from '../services/api.js';

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/dashboard').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm">Loading dashboard...</div>;
  if (!data) return <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm">Could not load dashboard data.</div>;

  const { student, attendance, recentAttendance, activeQrSessions } = data;

  const summaryCards = [
    { label: 'Attendance rate', value: `${attendance.percentage}%`, hint: `${attendance.present} of ${attendance.total} days present`, icon: TrendingUp, tone: 'from-emerald-500 to-teal-500' },
    { label: 'Present / Absent', value: `${attendance.present} / ${attendance.absent}`, hint: `${attendance.late} late`, icon: CalendarDays, tone: 'from-sky-500 to-cyan-500' },
    { label: 'Total records', value: attendance.total, hint: 'All-time attendance', icon: Sparkles, tone: 'from-violet-500 to-indigo-500' }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Student overview</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back, {student.fullName}.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {attendance.percentage >= 75 ? 'Your attendance is looking strong.' : 'Your attendance needs attention.'} You have {attendance.total} total records.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
              <UserRound size={16} className="text-teal-300" />
              {student.department || 'Student'} • {student.studentId || 'No ID'}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`inline-flex rounded-2xl bg-gradient-to-br ${tone} p-2.5 text-white`}>
              <Icon size={18} />
            </div>
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Recent classes</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Recent attendance</h3>
            </div>
            <div className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">Last 10</div>
          </div>

          {recentAttendance.length === 0 ? (
            <p className="mt-5 text-sm text-slate-400">No attendance records yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {recentAttendance.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.subject}</p>
                    <p className="text-sm text-slate-500">{item.attendanceDate} • {item.facultyName}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            <GraduationCap size={16} className="text-indigo-500" />
            Quick focus
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <QrCode size={16} className="text-teal-600" />
                {activeQrSessions.length > 0 ? `${activeQrSessions.length} active QR session(s)` : 'No active QR sessions'}
              </div>
              <p className="mt-2 text-sm text-slate-500">{activeQrSessions.length > 0 ? 'Scan a QR code from your faculty to mark attendance.' : 'Check with your faculty for available QR sessions.'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock3 size={16} className="text-indigo-600" />
                Keep your attendance streak alive
              </div>
              <p className="mt-2 text-sm text-slate-500">A small daily effort keeps your record strong and consistent.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays size={16} className="text-indigo-600" />
                Review upcoming sessions
              </div>
              <p className="mt-2 text-sm text-slate-500">Stay aware of class schedules and deadlines in one place.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;