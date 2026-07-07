import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Search, Sparkles, TrendingUp } from 'lucide-react';
import { getAttendanceHistory } from '../services/attendanceApi.js';

export default function StudentAttendanceHistory() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [subject, setSubject] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');

  const perPage = 10;

  const filters = useMemo(
    () => ({ subject, dateFrom, dateTo, status }),
    [subject, dateFrom, dateTo, status]
  );

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAttendanceHistory({ ...filters, page, limit: perPage });
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
  }, [filters, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const attendancePct = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Student</p>
        <h2 className="text-2xl font-semibold text-slate-900">Attendance History</h2>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white">
            <TrendingUp size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Attendance Rate</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{attendancePct}%</p>
          <p className="mt-1 text-sm text-slate-500">{stats.present} of {stats.total} days</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-2.5 text-white">
            <CalendarDays size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Total Classes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 p-2.5 text-white">
            <Sparkles size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Present / Absent</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.present} / {stats.absent}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 text-white">
            <Sparkles size={18} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Late Arrivals</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.late}</p>
        </div>
      </div>

      <div className="section-card mb-5 p-4">
        <div className="flex flex-wrap gap-3">
          <label className="input-group flex-1 min-w-[160px]">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} placeholder="Search subject" className="input-field" />
          </label>
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
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Faculty</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {data.map((a) => {
                const badgeClass = a.status === 'Present' ? 'badge badge-present' : a.status === 'Late' ? 'badge badge-late' : 'badge badge-absent';
                return (
                  <tr key={a.id} className="border-t border-slate-100 bg-white transition-all duration-200 hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 text-slate-600">{a.attendanceDate}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{a.subject}</td>
                    <td className="px-4 py-3.5 text-slate-600">{a.facultyName}</td>
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