import { useEffect, useState } from 'react';
import { Eye, PencilLine, Plus, Search, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listFaculty, deleteFaculty } from '../services/facultyApi.js';

export default function FacultyList() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchList();
  }, [q, department, page]);

  async function fetchList() {
    try {
      const res = await listFaculty({ q, department, page });
      setData(res.data);
      setTotal(res.total);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to load faculty');
    }
  }

  function handleDelete(id) {
    if (!confirm('Delete this faculty member?')) return;

    deleteFaculty(id)
      .then(() => {
        alert('Faculty deleted');
        fetchList();
      })
      .catch((err) => alert(err?.response?.data?.message || 'Delete failed'));
  }

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const departments = Array.from(new Set(data.map((d) => d.department).filter(Boolean)));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Faculty</p>
          <h2 className="text-2xl font-semibold text-slate-900">Faculty Directory</h2>
        </div>
        <Link to="/admin/faculty/add" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20">
          <Plus size={16} /> Add Faculty
        </Link>
      </div>

      <div className="mb-5 rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search faculty"
              className="w-full border-0 bg-transparent text-sm outline-none"
            />
          </label>

          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/80 shadow-sm">
        <table className="w-full table-auto">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-500">
                  No faculty members found for the current filters.
                </td>
              </tr>
            ) : (
              data.map((f) => (
                <tr key={f.id} className="border-t bg-white/60 transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-teal-100 p-2 text-teal-700"><Users size={16} /></div>
                      <span className="font-medium text-slate-900">{f.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{f.email}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{f.department || '-'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100" to={`/admin/faculty/${f.id}`} title="View">
                        <Eye size={15} />
                      </Link>
                      <Link className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100" to={`/admin/faculty/${f.id}/edit`} title="Edit">
                        <PencilLine size={15} />
                      </Link>
                      <button className="rounded-full border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50" onClick={() => handleDelete(f.id)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-600">Page {page} / {totalPages}</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50">
            Prev
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
