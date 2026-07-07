import { useEffect, useState } from 'react';
import { Eye, PencilLine, Plus, Search, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listAttendance, listFaculty } from '../services/attendanceApi.js';

export default function AttendanceList() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    fetchList();
    fetchFaculties();
  }, [q, department, facultyId, subject, date, status, page]);

  async function fetchList() {
    try {
      const res = await listAttendance({ q, department, facultyId, subject, date, status, page });
      setData(res.data);
      setTotal(res.total);
    } catch (err) {
      alert('Failed to load attendance');
    }
  }

  async function fetchFaculties() {
    try {
      const res = await listFaculty({});
      setFaculties(res.data || []);
    } catch (err) {}
  }

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Attendance</p>
          <h2 className="text-2xl font-semibold text-slate-900">Attendance Records</h2>
        </div>
        <Link to="/admin/attendance/mark" className="btn btn-primary">
          <Plus size={16} /> Mark Attendance
        </Link>
      </div>

      <div className="section-card mb-5 p-4">
        <div className="flex flex-wrap gap-3">
          <label className="input-group flex-1 min-w-[200px]">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student" className="input-field" />
          </label>
          <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="input-field w-auto rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <option value="">All Faculty</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>{f.fullName}</option>
            ))}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500">
            <option value="">Any Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table-base">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Faculty</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-16 text-center text-sm text-slate-400">
                  No attendance records found for the current filters.
                </td>
              </tr>
            ) : (
              data.map((a) => {
                const badgeClass = a.status === 'Present' ? 'badge badge-present' : a.status === 'Late' ? 'badge badge-late' : 'badge badge-absent';
                return (
                  <tr key={a.id} className="border-t border-slate-100 bg-white transition-all duration-200 hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-medium text-slate-700">{a.attendanceDate}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-full bg-teal-100 p-2 text-teal-700"><UserRoundCheck size={14} /></div>
                        <div>
                          <div className="font-medium text-slate-900">{a.studentName}</div>
                          <div className="text-xs text-slate-400">{a.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{a.facultyName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{a.subject}</td>
                    <td className="px-4 py-3.5"><span className={badgeClass}>{a.status}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link className="btn-icon" to={`/admin/attendance/${a.id}`} title="View"><Eye size={15} /></Link>
                        <Link className="btn-icon" to={`/admin/attendance/${a.id}/edit`} title="Edit"><PencilLine size={15} /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex animate-fade-in items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-600">Page {page} / {totalPages}</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-ghost rounded-full px-3 py-1.5 text-sm">Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="btn-ghost rounded-full px-3 py-1.5 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
}
