import { CalendarDays, Clock3, GraduationCap, Sparkles, TrendingUp, UserRound } from 'lucide-react';

function StudentDashboard() {
  const summaryCards = [
    { label: 'Attendance rate', value: '92%', hint: '+6% this month', icon: TrendingUp, tone: 'from-emerald-500 to-teal-500' },
    { label: 'Classes today', value: '4', hint: '2 pending check-ins', icon: CalendarDays, tone: 'from-sky-500 to-cyan-500' },
    { label: 'Learning streak', value: '14 days', hint: 'Keep it going', icon: Sparkles, tone: 'from-violet-500 to-indigo-500' }
  ];

  const weeklySummary = [
    { title: 'Mathematics', detail: 'Present • 09:00', status: 'On track' },
    { title: 'Physics', detail: 'Present • 11:00', status: 'On track' },
    { title: 'English', detail: 'Absent • 14:00', status: 'Needs follow-up' }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">Student overview</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Your attendance is looking strong this week.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Review your recent sessions, stay ahead of absences, and keep your routine consistent.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
              <UserRound size={16} className="text-teal-300" />
              Student profile ready
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
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Weekly summary</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Recent classes</h3>
            </div>
            <div className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">Updated today</div>
          </div>

          <div className="mt-5 space-y-3">
            {weeklySummary.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.detail}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Needs follow-up' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            <GraduationCap size={16} className="text-indigo-500" />
            Quick focus
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock3 size={16} className="text-teal-600" />
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
