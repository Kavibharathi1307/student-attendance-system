import { useEffect, useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { listQrSessions } from '../services/qrApi.js';

export default function AdminQrSessions() {
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  useEffect(() => {
    fetchSessions();
  }, [page]);

  async function fetchSessions() {
    try {
      const res = await listQrSessions({ page, perPage });
      setSessions(res.data);
      setTotal(res.total);
    } catch (err) {
      alert('Failed to load QR sessions');
    }
  }

  function isExpired(expiresAt) {
    return new Date(expiresAt) < new Date();
  }

  function isActive(session) {
    return session.isActive && !isExpired(session.expiresAt);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">QR Sessions</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">All QR Sessions</h2>
        <p className="mt-1 text-sm text-slate-500">Monitor all generated QR codes and their status.</p>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <QrCode size={48} className="text-slate-300" />
            <p className="mt-4 text-sm text-slate-400">No QR sessions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  <th className="px-5 py-4">Token</th>
                  <th className="px-5 py-4">Faculty</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Expires</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const active = isActive(s);
                  return (
                    <tr key={s.id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700">
                          {s.token.slice(0, 12)}...
                        </code>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">{s.facultyName || '-'}</td>
                      <td className="px-5 py-4 text-slate-600">{s.subject}</td>
                      <td className="px-5 py-4 text-slate-600">{s.attendanceDate}</td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          {new Date(s.expiresAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            <XCircle size={12} />
                            Expired
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
