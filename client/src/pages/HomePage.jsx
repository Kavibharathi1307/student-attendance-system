import { BarChart3, BookOpenCheck, ShieldCheck } from 'lucide-react';

function HomePage() {
  const highlights = [
    { title: 'Attendance tracking', description: 'Capture and review attendance records with a polished admin experience.', icon: BookOpenCheck },
    { title: 'Analytics insights', description: 'Monitor trends and understand participation patterns at a glance.', icon: BarChart3 },
    { title: 'Secure access', description: 'Role-based views keep the experience tailored for students, faculty, and admins.', icon: ShieldCheck }
  ];

  return (
    <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-10 lg:p-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">Attendance OS</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Student Attendance Monitoring and Analytics System
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            A modern, role-aware experience for managing attendance, faculty records, and reporting without sacrificing clarity or reliability.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="inline-flex rounded-2xl bg-teal-600/10 p-2.5 text-teal-700">
                <Icon size={18} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomePage;
