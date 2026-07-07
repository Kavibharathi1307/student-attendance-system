import { useEffect, useState } from 'react';
import { BookOpenCheck, CalendarClock, ClipboardCheck, QrCode, Users } from 'lucide-react';
import api from '../services/api.js';

function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty/dashboard').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner" />;
  if (!data) return <div className="error-state"><p className="error-state-text">Could not load dashboard data.</p></div>;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-900 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Faculty overview</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back, {data.faculty.fullName}.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {data.faculty.department ? `${data.faculty.department} • ` : ''}{data.todayAttendance} attendance records captured today.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex rounded-2xl bg-indigo-600/10 p-2.5 text-indigo-600">
            <ClipboardCheck size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Today's attendance</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{data.todayAttendance}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex rounded-2xl bg-emerald-600/10 p-2.5 text-emerald-600">
            <BookOpenCheck size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Total attendance</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{data.totalAttendance}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex rounded-2xl bg-amber-600/10 p-2.5 text-amber-600">
            <Users size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Students monitored</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{data.totalStudents}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-700">Recent activity</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Recent attendance</h3>
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
                    <p className="text-sm text-slate-500">{rec.subject} • {rec.attendanceDate}</p>
                  </div>
                  <span className={`badge ${rec.status === 'Present' ? 'badge-present' : rec.status === 'Late' ? 'badge-late' : 'badge-absent'}`}>
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            <QrCode size={16} className="text-indigo-500" />
            QR Attendance
          </div>
          <div className="mt-5 space-y-3">
            {data.activeQrSession ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <QrCode size={16} />
                  Active QR session
                </div>
                <p className="mt-2 text-sm text-slate-600">Subject: {data.activeQrSession.subject}</p>
                <p className="text-sm text-slate-600">Expires: {new Date(data.activeQrSession.expiresAt).toLocaleTimeString()}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <QrCode size={16} className="text-slate-400" />
                  No active QR session
                </div>
                <p className="mt-2 text-sm text-slate-500">Generate a QR code from the QR Attendance page to let students mark attendance.</p>
              </div>
            )}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarClock size={16} className="text-indigo-600" />
                Stay on track
              </div>
              <p className="mt-2 text-sm text-slate-500">Use QR codes for quick and contactless attendance tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;