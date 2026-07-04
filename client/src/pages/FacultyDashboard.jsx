import { BookOpenCheck, CalendarClock, ClipboardCheck, Users } from 'lucide-react';

function FacultyDashboard() {
  const tasks = [
    { label: 'Attendance review', detail: 'Finalize today’s session summary', icon: ClipboardCheck },
    { label: 'Upcoming class', detail: 'Physics • 11:00', icon: CalendarClock },
    { label: 'Student check-ins', detail: '3 students marked late', icon: Users }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-900 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Faculty overview</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Stay on top of attendance and class flow.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Use the dashboard to quickly review attendance activity and keep academic routines running smoothly.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex rounded-2xl bg-indigo-600/10 p-2.5 text-indigo-600">
            <BookOpenCheck size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Classes today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">6</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex rounded-2xl bg-emerald-600/10 p-2.5 text-emerald-600">
            <ClipboardCheck size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Attendance captured</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">94%</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="inline-flex rounded-2xl bg-amber-600/10 p-2.5 text-amber-600">
            <Users size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Students monitored</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">128</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-700">Today’s focus</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Priority tasks</h3>
          </div>
          <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">Action list</div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {tasks.map(({ label, detail, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="inline-flex rounded-2xl bg-white p-2 text-slate-700 shadow-sm">
                <Icon size={16} />
              </div>
              <p className="mt-3 font-medium text-slate-900">{label}</p>
              <p className="mt-1 text-sm text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
