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

      <div className="section-card mb-5 p-4">
        <div className="flex flex-wrap gap-3">
          <label className="input-group flex-1 min-w-[160px]">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} placeholder="Search subject" className="input-field" />
          </label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500" />
          <label className="input-group flex-1 min-w-[160px]">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input value={student} onChange={(e) => { setStudent(e.target.value); setPage(1); }} placeholder="Search student" className="input-field" />
          </label>
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