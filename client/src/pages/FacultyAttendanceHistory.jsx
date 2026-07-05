import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { getAttendanceHistory, exportAttendanceHistoryCsv } from '../services/attendanceApi.js';

export default function FacultyAttendanceHistory() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [subject, setSubject] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [student, setStudent] = useState('');
  const [status, setStatus] = useState('');

  const perPage = 10;

  const filters = useMemo(
    () => ({ subject, dateFrom, dateTo, student, status }),
    [subject, dateFrom, dateTo, student, status]
  );

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAttendanceHistory({ ...filters, page, limit: perPage });
      setData(res.data);
      setTotal(res.total);
    } catch {
      setError('Failed to load attendance history.');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  async function handleExportCsv() {
    try {
      const blob = await exportAttendanceHistoryCsv(filters);
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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Faculty</p>
          <h2 className="text-2xl font-semibold text-slate-900">Attendance History</h2>
        </div>
        <button onClick={handleExportCsv} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="mb-5 rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[180px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} placeholder="Search subject" className="w-full border-0 bg-transparent text-sm outline-none" />
          </label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" />
          <label className="flex min-w-[180px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input value={student} onChange={(e) => { setStudent(e.target.value); setPage(1); }} placeholder="Search student" className="w-full border-0 bg-transparent text-sm outline-none" />
          </label>
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