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
        <button onClick={handleExportCsv} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Records</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Present</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{stats.present}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Absent</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{stats.absent}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Late</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.late}</p>
        </div>
      </div>

      <div className="mb-5 rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input value={student} onChange={(e) => { setStudent(e.target.value); setPage(1); }} placeholder="Search student" className="w-full border-0 bg-transparent text-sm outline-none" />
          </label>
          <select value={faculty} onChange={(e) => { setFaculty(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">
            <option value="">Any Faculty</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>{f.fullName}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} placeholder="Search subject" className="w-full border-0 bg-transparent text-sm outline-none" />
          </label>
          <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">
            <option value="">Any Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">
            <option value="">Any Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>

      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          <div>Loading attendance history…</div>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600 shadow-sm">No attendance records found. Try different filters.</div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/80 shadow-sm">
          <table className="w-full table-auto">
            <thead className="bg-slate-50 text-left text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Register Number</th>
                <th className="px-4 py-3">Faculty</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {data.map((a) => {
                const badgeClass = a.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : a.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
                return (
                  <tr key={a.id} className="border-t bg-white/60 transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{a.studentName}</td>
                    <td className="px-4 py-3 text-slate-500">{a.registerNumber || '-'}</td>
                    <td className="px-4 py-3">{a.facultyName}</td>
                    <td className="px-4 py-3">{a.subject}</td>
                    <td className="px-4 py-3">{a.attendanceDate}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>{a.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-600">Page {page} / {totalPages}</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50">Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}