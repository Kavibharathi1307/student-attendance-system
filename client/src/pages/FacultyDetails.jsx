import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { getFaculty } from '../services/facultyApi.js';

export default function FacultyDetails() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    getFaculty(id)
      .then((res) => setFaculty(res.faculty))
      .catch(() => alert('Failed to load'));
  }, [id]);

  if (!faculty) {
    return <div className="loading-spinner" />;
  }

  const details = [
    { label: 'Full name', value: faculty.fullName, icon: UserRound },
    { label: 'Email', value: faculty.email, icon: Mail },
    { label: 'Department', value: faculty.department || 'Not specified', icon: ShieldCheck },
    { label: 'Joined', value: faculty.createdAt || '—', icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/faculty" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4" />
            Back to faculty
          </Link>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Faculty details</h2>
          <p className="mt-1 text-sm text-slate-500">Review the faculty profile and key details.</p>
        </div>
        <Link to={`/admin/faculty/${id}/edit`} className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
          Edit profile
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-600">Faculty profile</p>
              <h3 className="text-xl font-semibold text-slate-900">{faculty.fullName}</h3>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          {details.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Icon className="h-4 w-4 text-indigo-500" />
                {label}
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
