import { Eye, PencilLine, Trash2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

function StudentTable({ students, onView, onEdit, onDelete, loading }) {
  if (loading) {
    return <div className="loading-spinner">Loading students...</div>;
  }

  if (!students.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><UserRound size={20} /></div>
        <p className="empty-state-title">No students found</p>
        <p className="empty-state-text">No students match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {students.map((student) => {
              const status = student.status || 'Active';
              const badgeClass = status === 'Active'
                ? 'badge badge-active'
                : status === 'Inactive'
                  ? 'badge badge-inactive'
                  : 'badge badge-expired';

              return (
                <tr key={student.id} className="border-t border-slate-100 bg-white transition-all duration-200 hover:bg-slate-50/80">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-teal-100 p-2 text-teal-700">
                        <UserRound size={15} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{student.fullName}</div>
                        <div className="text-xs text-slate-400">{student.studentId || student.userId || student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{student.email}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {student.department || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={badgeClass}>{status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button className="btn-icon" onClick={() => onView(student)} title="View" type="button">
                        <Eye size={15} />
                      </button>
                      <Link className="btn-icon" to={`/admin/students/${student.id}/edit`} title="Edit">
                        <PencilLine size={15} />
                      </Link>
                      <button className="btn-icon-rose" onClick={() => onDelete(student)} title="Delete" type="button">
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
