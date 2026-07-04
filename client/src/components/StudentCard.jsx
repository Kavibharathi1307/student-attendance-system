import { BookOpenCheck, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';

function StudentCard({ student }) {
  const info = [
    { label: 'Email', value: student.email, icon: Mail },
    { label: 'Phone', value: student.phone || '—', icon: Phone },
    { label: 'Department', value: student.department || '—', icon: BookOpenCheck },
    { label: 'Address', value: student.address || '—', icon: MapPin }
  ];

  return (
    <div className="grid gap-4 p-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
            <UserRound size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Student summary</p>
            <p className="text-lg font-semibold text-slate-900">{student.fullName}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ShieldCheck size={16} className="text-teal-600" />
            Status
          </div>
          <p className="mt-2 text-sm text-slate-600">{student.status || 'Active'}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {info.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Icon size={15} className="text-teal-600" />
              {label}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentCard;
