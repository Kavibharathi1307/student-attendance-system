import { Eye, PencilLine, Trash2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

function StudentTable({ students, onView, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500 shadow-sm">
        Loading students...
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500 shadow-sm">
        No students match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/80 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {students.map((student) => {
              const status = student.status || 'Active';
              const badgeClass = status === 'Active'
                ? 'bg-emerald-100 text-emerald-700'
                : status === 'Inactive'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-amber-100 text-amber-700';

              return (
                <tr key={student.id} className="border-t bg-white/60 transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-teal-100 p-2 text-teal-700">
                        <UserRound size={15} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{student.fullName}</div>
                        <div className="text-xs text-slate-500">{student.studentId || student.userId || student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {student.department || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                        onClick={() => onView(student)}
                        title="View"
                        type="button"
                      >
                        <Eye size={15} />
                      </button>
                      <Link
                        className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                        to={`/admin/students/${student.id}/edit`}
                        title="Edit"
                      >
                        <PencilLine size={15} />
                      </Link>
                      <button
                        className="rounded-full border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                        onClick={() => onDelete(student)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentTable;
