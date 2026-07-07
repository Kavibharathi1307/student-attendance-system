import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { getAttendanceHistory, exportAttendanceHistoryCsv, listFaculty } from '../services/attendanceApi.js';

export default function AdminAttendanceHistory() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [faculties, setFaculties] = useState([]);

  const [student, setStudent] = useState('');
  const [faculty, setFaculty] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');

  const perPage = 10;

  const departments = useMemo(
    () => Array.from(new Set((faculties || []).map((f) => f.department).filter(Boolean))).sort(),
    [faculties]
  );

  const filters = useMemo(
    () => ({ student, faculty, subject, department, dateFrom, dateTo, status }),
    [student, faculty, subject, department, dateFrom, dateTo, status]
  );

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters, page, limit: perPage };
      if (faculty) params.faculty = faculty;
      const res = await getAttendanceHistory(params);
      setData(res.data);
      setTotal(res.total);
      setStats(res.stats);
    } catch {
      setError('Failed to load attendance history.');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, faculty]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    listFaculty({ perPage: 100 }).then((r) => setFaculties(r.data || [])).catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  async function handleExportCsv() {
    try {
      const params = { ...filters };
      if (faculty) params.faculty = faculty;
      const blob = await exportAttendanceHistoryCsv(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance-history.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('CSV export failed.');
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Admin</p>
          <h2 className="text-2xl font-semibold text-slate-900">Attendance History</h2>
        </div>
        <button onClick={handleExportCsv} className="btn bg-slate-950 text-white hover:bg-slate-800 rounded-2xl">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <p className="text-sm text-slate-500">Total Records</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Present</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{stats.present}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Absent</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{stats.absent}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Late</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.late}</p>
        </div>
      </div>

      <div className="section-card mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="input-group">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input value={student} onChange={(e) => { setStudent(e.target.value); setPage(1); }} placeholder="Search student" className="input-field" />
          </label>
          <select value={faculty} onChange={(e) => { setFaculty(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500">
            <option value="">Any Faculty</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>{f.fullName}</option>
            ))}
          </select>
          <label className="input-group">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} placeholder="Search subject" className="input-field" />
          </label>
          <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500">
            <option value="">Any Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500">
            <option value="">Any Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>

      {error && <div className="error-state mb-4 flex-row justify-start px-4 py-3"><p className="error-state-text">{error}</p></div>}

      {loading ? (
        <div className="loading-spinner">Loading attendance history...</div>
      ) : data.length === 0 ? (
        <div className="empty-state"><p className="empty-state-title">No records found</p><p className="empty-state-text">No attendance records match the current filters.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="table-base">
            <thead className="bg-slate-50 text-left text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Register Number</th>
                <th className="px-4 py-3 font-semibold">Faculty</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {data.map((a) => {
                const badgeClass = a.status === 'Present' ? 'badge badge-present' : a.status === 'Late' ? 'badge badge-late' : 'badge badge-absent';
                return (
                  <tr key={a.id} className="border-t border-slate-100 bg-white transition-all duration-200 hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-medium text-slate-900">{a.studentName}</td>
                    <td className="px-4 py-3.5 text-slate-400">{a.registerNumber || '-'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{a.facultyName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{a.subject}</td>
                    <td className="px-4 py-3.5 text-slate-600">{a.attendanceDate}</td>
                    <td className="px-4 py-3.5"><span className={badgeClass}>{a.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-600">Page {page} / {totalPages}</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-ghost rounded-full px-3 py-1.5 text-sm">Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="btn-ghost rounded-full px-3 py-1.5 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
}