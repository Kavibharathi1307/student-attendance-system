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
    <div className="fade-in">
      <div className="page-header flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="page-header-subtitle">Faculty</p>
          <h2 className="page-header-title">Faculty Directory</h2>
        </div>
        <Link to="/admin/faculty/add" className="btn btn-primary">
          <Plus size={16} /> Add Faculty
        </Link>
      </div>

      <div className="section-card mb-5 p-4">
        <div className="flex flex-wrap gap-3">
          <label className="input-group flex-1 min-w-[240px]">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search faculty"
              className="input-field"
            />
          </label>

          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-teal-500">
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table-base">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-16 text-center text-sm text-slate-400">
                  No faculty members found for the current filters.
                </td>
              </tr>
            ) : (
              data.map((f) => (
                <tr key={f.id} className="border-t border-slate-100 bg-white transition-all duration-200 hover:bg-slate-50/80">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-teal-100 p-2 text-teal-700"><Users size={16} /></div>
                      <span className="font-medium text-slate-900">{f.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{f.email}</td>
                  <td className="px-4 py-3.5"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{f.department || '-'}</span></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Link className="btn-icon" to={`/admin/faculty/${f.id}`} title="View">
                        <Eye size={15} />
                      </Link>
                      <Link className="btn-icon" to={`/admin/faculty/${f.id}/edit`} title="Edit">
                        <PencilLine size={15} />
                      </Link>
                      <button className="btn-icon-rose" onClick={() => handleDelete(f.id)} title="Delete">
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

      <div className="mt-4 flex items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-600">Page {page} / {totalPages}</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-ghost rounded-full px-3 py-1.5 text-sm">
            Prev
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="btn-ghost rounded-full px-3 py-1.5 text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
