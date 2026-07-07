import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, CalendarDays, FileText, UserRound, Users } from 'lucide-react';
import { getAttendance } from '../services/attendanceApi.js';

export default function AttendanceDetails() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);

  useEffect(() => {
    getAttendance(id).then((r) => setRec(r.attendance)).catch(() => alert('Failed'));
  }, [id]);

  if (!rec) {
    return <div className="loading-spinner" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/attendance" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4" />
            Back to attendance
          </Link>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Attendance details</h2>
          <p className="mt-1 text-sm text-slate-500">Review attendance information and comments.</p>
        </div>
        <Link to={`/admin/attendance/${id}/edit`} className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
          Edit record
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 via-white to-indigo-50 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/10 text-cyan-600">
                <BookOpenCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-600">Attendance record</p>
                <h3 className="text-xl font-semibold text-slate-900">{rec.studentName}</h3>
              </div>
            </div>
            <span className={`badge text-sm ${rec.status === 'Present' ? 'badge-present' : rec.status === 'Late' ? 'badge-late' : 'badge-absent'}`}>
              {rec.status}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays className="h-4 w-4 text-cyan-500" />
              Date
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">{rec.attendanceDate}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users className="h-4 w-4 text-cyan-500" />
              Student
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">{rec.studentName} ({rec.studentId})</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <UserRound className="h-4 w-4 text-cyan-500" />
              Faculty
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">{rec.facultyName}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <FileText className="h-4 w-4 text-cyan-500" />
              Subject
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">{rec.subject}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <FileText className="h-4 w-4 text-cyan-500" />
            Remarks
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{rec.remarks || 'No remarks added.'}</p>
        </div>
      </div>
    </div>
  );
}
